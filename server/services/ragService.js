import { v4 as uuidv4 } from "uuid";
import sql from "../configs/db.js";
import {
  processDocument,
  prepareChunksForEmbedding,
  generateContentHash,
} from "./documentProcessor.js";
import {
  generateBatchEmbeddings,
  generateEmbeddingForSearch,
} from "./embeddingService.js";
import { upsertVectors, queryVectors } from "./pineconeService.js";

/**
 * Finds an active knowledge base with the given name for a user, or creates one.
 * Used so features (like the Support Assistant) can maintain a persistent,
 * per-user knowledge base without the user having to manage KBs manually.
 */
export const getOrCreateKnowledgeBase = async (userId, name, description = "") => {
  const existing = await sql`
    SELECT id FROM knowledge_bases
    WHERE user_id = ${userId} AND name = ${name} AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0].id;
  }

  const kbId = uuidv4();
  await sql`
    INSERT INTO knowledge_bases (id, user_id, name, description)
    VALUES (${kbId}, ${userId}, ${name}, ${description})
  `;

  return kbId;
};

/**
 * Chunks, embeds, and indexes a document (PDF/TXT) into a knowledge base.
 * Skips re-indexing if identical content was already uploaded to this KB.
 */
export const indexDocument = async (kbId, file) => {
  const processed = await processDocument(file.buffer, file.originalname);
  const contentHash = generateContentHash(processed.content);

  const existing = await sql`
    SELECT id FROM documents
    WHERE kb_id = ${kbId} AND content_hash = ${contentHash}
  `;

  if (existing.length > 0) {
    return { doc_id: existing[0].id, chunks_created: 0, duplicate: true };
  }

  const docId = uuidv4();

  await sql`
    INSERT INTO documents (id, kb_id, filename, content, file_size, content_hash)
    VALUES (${docId}, ${kbId}, ${file.originalname}, ${processed.content}, ${file.size}, ${contentHash})
  `;

  const chunksData = prepareChunksForEmbedding(processed.chunks, docId, kbId);
  const embeddings = await generateBatchEmbeddings(chunksData.map((c) => c.text));

  const vectors = embeddings.map((embedding, index) => ({
    id: chunksData[index].id,
    values: embedding,
    metadata: {
      ...chunksData[index].metadata,
      text: chunksData[index].text,
    },
  }));

  await upsertVectors(vectors);

  for (let i = 0; i < processed.chunks.length; i++) {
    await sql`
      INSERT INTO document_chunks (id, doc_id, chunk_text, chunk_index, vector_id, metadata)
      VALUES (
        ${uuidv4()},
        ${docId},
        ${processed.chunks[i]},
        ${i},
        ${vectors[i].id},
        ${JSON.stringify(chunksData[i].metadata)}
      )
    `;
  }

  return { doc_id: docId, chunks_created: processed.chunks.length, duplicate: false };
};

/**
 * Runs a semantic (vector) search against a knowledge base and returns
 * assembled context text plus the source chunks used, for grounding a
 * generation call. Returns empty context/sources if nothing is indexed yet
 * or nothing relevant is found.
 */
export const retrieveContext = async (kbId, query, topK = 5) => {
  const queryEmbedding = await generateEmbeddingForSearch(query);
  const results = await queryVectors(queryEmbedding, topK, { kb_id: kbId });

  if (!results || results.length === 0) {
    return { context: "", sources: [] };
  }

  const context = results
    .map((r, idx) => `Source ${idx + 1}: ${r.metadata?.text}`)
    .join("\n\n");

  const sources = results.map((r) => ({
    id: r.id,
    score: r.score,
    doc_id: r.metadata?.doc_id,
  }));

  return { context, sources };
};
