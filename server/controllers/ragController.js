import { v4 as uuidv4 } from "uuid";
import sql from "../configs/db.js";
import OpenAI from "openai";
import {
  processDocument,
  prepareChunksForEmbedding,
  generateContentHash,
} from "../services/documentProcessor.js";
import {
  generateEmbedding,
  generateBatchEmbeddings,
  generateEmbeddingForSearch,
} from "../services/embeddingService.js";
import {
  upsertVectors,
  queryVectors,
  deleteVectors,
  createIndexIfNotExists,
} from "../services/pineconeService.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Initialize Pinecone on startup
try {
  await createIndexIfNotExists();
} catch (error) {
  console.log("⚠️ Pinecone initialization warning:", error.message);
}

export const createKnowledgeBase = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.json({
        success: false,
        message: "Knowledge base name is required",
      });
    }

    const kbId = uuidv4();
    await sql`
      INSERT INTO knowledge_bases (id, user_id, name, description)
      VALUES (${kbId}, ${userId}, ${name}, ${description || null})
    `;

    res.json({
      success: true,
      message: "Knowledge base created successfully",
      kb_id: kbId,
    });
  } catch (error) {
    console.error("Error creating knowledge base:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const listKnowledgeBases = async (req, res) => {
  try {
    const { userId } = req.auth();

    const kbs = await sql`
      SELECT id, name, description, created_at, updated_at
      FROM knowledge_bases
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
    `;

    res.json({ success: true, knowledge_bases: kbs });
  } catch (error) {
    console.error("Error listing knowledge bases:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { kb_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.json({
        success: false,
        message: "No file provided",
      });
    }

    if (!kb_id) {
      return res.json({
        success: false,
        message: "Knowledge base ID is required",
      });
    }

    // Verify KB belongs to user
    const kb = await sql`
      SELECT id FROM knowledge_bases
      WHERE id = ${kb_id} AND user_id = ${userId}
    `;

    if (kb.length === 0) {
      return res.json({
        success: false,
        message: "Knowledge base not found",
      });
    }

    // Process document
    const processed = await processDocument(file.buffer, file.originalname);
    const contentHash = generateContentHash(processed.content);

    // Check for duplicates
    const existing = await sql`
      SELECT id FROM documents
      WHERE kb_id = ${kb_id} AND content_hash = ${contentHash}
    `;

    if (existing.length > 0) {
      return res.json({
        success: false,
        message: "Document with same content already exists in this KB",
      });
    }

    const docId = uuidv4();

    // Save document to DB
    await sql`
      INSERT INTO documents (id, kb_id, filename, content, file_size, content_hash)
      VALUES (${docId}, ${kb_id}, ${file.originalname}, ${processed.content}, ${file.size}, ${contentHash})
    `;

    // Prepare chunks for embedding
    const chunksData = prepareChunksForEmbedding(
      processed.chunks,
      docId,
      kb_id
    );

    // Generate embeddings
    const embeddings = await generateBatchEmbeddings(
      chunksData.map((c) => c.text)
    );

    // Prepare vectors for Pinecone
    const vectors = embeddings.map((embedding, index) => ({
      id: chunksData[index].id,
      values: embedding,
      metadata: {
        ...chunksData[index].metadata,
        text: chunksData[index].text,
      },
    }));

    // Upsert to Pinecone
    await upsertVectors(vectors);

    // Save chunk metadata to DB
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

    res.json({
      success: true,
      message: "Document uploaded and indexed successfully",
      doc_id: docId,
      chunks_created: processed.chunks.length,
    });
  } catch (error) {
    console.error("Error uploading document:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { kb_id, query, top_k = 5 } = req.body;

    if (!kb_id || !query) {
      return res.json({
        success: false,
        message: "Knowledge base ID and query are required",
      });
    }

    // Verify KB belongs to user
    const kb = await sql`
      SELECT id FROM knowledge_bases
      WHERE id = ${kb_id} AND user_id = ${userId}
    `;

    if (kb.length === 0) {
      return res.json({
        success: false,
        message: "Knowledge base not found",
      });
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbeddingForSearch(query);

    // Search in Pinecone with KB filter
    const results = await queryVectors(queryEmbedding, top_k, {
      kb_id: kb_id,
    });

    if (results.length === 0) {
      return res.json({
        success: true,
        message: "No relevant documents found",
        results: [],
      });
    }

    res.json({
      success: true,
      message: "Search completed successfully",
      results: results.map((r) => ({
        id: r.id,
        score: r.score,
        text: r.metadata?.text,
        doc_id: r.metadata?.doc_id,
        chunk_index: r.metadata?.chunk_index,
      })),
    });
  } catch (error) {
    console.error("Error searching documents:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateWithRAG = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { kb_id, prompt, use_rag = true, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.json({
        success: false,
        message: "Prompt is required",
      });
    }

    let context = "";
    let sources = [];

    if (use_rag && kb_id) {
      // Verify KB belongs to user
      const kb = await sql`
        SELECT id FROM knowledge_bases
        WHERE id = ${kb_id} AND user_id = ${userId}
      `;

      if (kb.length === 0) {
        return res.json({
          success: false,
          message: "Knowledge base not found",
        });
      }

      // Search for relevant documents
      const queryEmbedding = await generateEmbeddingForSearch(prompt);
      const results = await queryVectors(queryEmbedding, 5, {
        kb_id: kb_id,
      });

      if (results.length > 0) {
        context = results
          .map((r, idx) => `Source ${idx + 1}: ${r.metadata?.text}`)
          .join("\n\n");

        sources = results.map((r) => ({
          id: r.id,
          score: r.score,
          doc_id: r.metadata?.doc_id,
        }));
      }
    }

    // Build the enhanced prompt
    let enhancedPrompt = prompt;
    if (context) {
      enhancedPrompt = `Based on the following documents:\n\n${context}\n\nPlease answer this question: ${prompt}`;
    }

    // Generate response using Gemini
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      temperature,
      max_tokens: 1000,
    });

    const generatedContent = response.choices[0].message.content;

    // Save to RAG query history
    await sql`
      INSERT INTO rag_queries (id, user_id, kb_id, query, response, sources)
      VALUES (${uuidv4()}, ${userId}, ${kb_id || null}, ${prompt}, ${generatedContent}, ${JSON.stringify(
        sources
      )})
    `;

    res.json({
      success: true,
      message: "Response generated successfully",
      response: generatedContent,
      sources: sources.length > 0 ? sources : null,
      used_rag: use_rag && context.length > 0,
    });
  } catch (error) {
    console.error("Error generating with RAG:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { doc_id } = req.params;

    // Get document and verify ownership
    const doc = await sql`
      SELECT d.id, d.kb_id, dc.vector_id
      FROM documents d
      JOIN knowledge_bases kb ON d.kb_id = kb.id
      LEFT JOIN document_chunks dc ON d.id = dc.doc_id
      WHERE d.id = ${doc_id} AND kb.user_id = ${userId}
    `;

    if (doc.length === 0) {
      return res.json({
        success: false,
        message: "Document not found or access denied",
      });
    }

    // Collect vector IDs to delete from Pinecone
    const vectorIds = doc
      .filter((row) => row.vector_id)
      .map((row) => row.vector_id);

    // Delete vectors from Pinecone
    if (vectorIds.length > 0) {
      await deleteVectors(vectorIds);
    }

    // Delete document chunks from DB (cascades from documents)
    await sql`
      DELETE FROM documents
      WHERE id = ${doc_id}
    `;

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getKnowledgeBaseStats = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { kb_id } = req.params;

    // Verify KB belongs to user
    const kb = await sql`
      SELECT id FROM knowledge_bases
      WHERE id = ${kb_id} AND user_id = ${userId}
    `;

    if (kb.length === 0) {
      return res.json({
        success: false,
        message: "Knowledge base not found",
      });
    }

    const stats = await sql`
      SELECT
        COUNT(DISTINCT d.id) as document_count,
        COUNT(dc.id) as chunk_count,
        SUM(d.file_size) as total_size
      FROM documents d
      LEFT JOIN document_chunks dc ON d.id = dc.doc_id
      WHERE d.kb_id = ${kb_id}
    `;

    res.json({
      success: true,
      stats: stats[0] || {
        document_count: 0,
        chunk_count: 0,
        total_size: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching KB stats:", error.message);
    res.json({ success: false, message: error.message });
  }
};
