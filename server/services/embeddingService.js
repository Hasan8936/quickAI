import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

const initGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return genAI;
};

export const generateEmbedding = async (text) => {
  try {
    const ai = initGenAI();
    const model = ai.getGenerativeModel({ model: "embedding-001" });

    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    return embedding;
  } catch (error) {
    console.error("❌ Failed to generate embedding:", error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
};

export const generateBatchEmbeddings = async (texts) => {
  try {
    const embeddings = await Promise.all(
      texts.map((text) => generateEmbedding(text))
    );
    return embeddings;
  } catch (error) {
    console.error("❌ Failed to generate batch embeddings:", error.message);
    throw error;
  }
};

export const generateEmbeddingForSearch = async (query) => {
  try {
    const embedding = await generateEmbedding(query);
    return embedding;
  } catch (error) {
    console.error("❌ Failed to generate search embedding:", error.message);
    throw error;
  }
};
