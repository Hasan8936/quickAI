import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient = null;

export const initPinecone = async () => {
  if (pineconeClient) return pineconeClient;

  try {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("✅ Pinecone initialized successfully");
    return pineconeClient;
  } catch (error) {
    console.error("❌ Failed to initialize Pinecone:", error.message);
    throw new Error("Pinecone initialization failed");
  }
};

export const getPineconeIndex = async (indexName = "quickai-rag") => {
  const client = await initPinecone();
  return client.index(indexName);
};

export const upsertVectors = async (vectors, indexName = "quickai-rag") => {
  try {
    const index = await getPineconeIndex(indexName);
    await index.upsert(vectors);
    console.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);
    return true;
  } catch (error) {
    console.error("❌ Failed to upsert vectors:", error.message);
    throw error;
  }
};

export const queryVectors = async (
  embedding,
  topK = 5,
  filter = {},
  indexName = "quickai-rag"
) => {
  try {
    const index = await getPineconeIndex(indexName);
    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter,
    });
    return results.matches || [];
  } catch (error) {
    console.error("❌ Failed to query vectors:", error.message);
    throw error;
  }
};

export const deleteVectors = async (vectorIds, indexName = "quickai-rag") => {
  try {
    const index = await getPineconeIndex(indexName);
    await index.deleteMany(vectorIds);
    console.log(`✅ Deleted ${vectorIds.length} vectors from Pinecone`);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete vectors:", error.message);
    throw error;
  }
};

export const createIndexIfNotExists = async (indexName = "quickai-rag") => {
  try {
    const client = await initPinecone();

    try {
      // Try to get index stats to check if it exists
      await client.index(indexName).describeIndexStats();
      console.log(`✅ Pinecone index already exists: ${indexName}`);
    } catch (error) {
      // Index doesn't exist, create it
      await client.createIndex({
        name: indexName,
        dimension: 768,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log(`✅ Created Pinecone index: ${indexName}`);
    }
  } catch (error) {
    console.error("❌ Failed to create index:", error.message);
    throw error;
  }
};
