import pdf from "pdf-parse/lib/pdf-parse.js";
import crypto from "crypto";

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error("❌ Failed to extract PDF text:", error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

export const chunkText = (text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const chunks = [];
  let startIdx = 0;

  while (startIdx < text.length) {
    const endIdx = Math.min(startIdx + chunkSize, text.length);
    const chunk = text.substring(startIdx, endIdx).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIdx = endIdx - overlap;
  }

  return chunks;
};

export const processDocument = async (fileBuffer, filename) => {
  try {
    let content = "";

    if (filename.endsWith(".pdf")) {
      content = await extractTextFromPDF(fileBuffer);
    } else if (filename.endsWith(".txt")) {
      content = fileBuffer.toString("utf-8");
    } else {
      throw new Error("Unsupported file format. Only PDF and TXT are supported.");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Document contains no readable text");
    }

    const chunks = chunkText(content);
    return {
      content,
      chunks,
      chunkCount: chunks.length,
    };
  } catch (error) {
    console.error("❌ Failed to process document:", error.message);
    throw error;
  }
};

export const generateContentHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

export const prepareChunksForEmbedding = (chunks, docId, kbId) => {
  return chunks.map((chunk, index) => ({
    id: `${docId}-chunk-${index}`,
    text: chunk,
    metadata: {
      doc_id: docId,
      kb_id: kbId,
      chunk_index: index,
      chunk_size: chunk.length,
    },
  }));
};
