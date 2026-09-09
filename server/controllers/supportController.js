import { v4 as uuidv4 } from "uuid";
import sql from "../configs/db.js";
import OpenAI from "openai";
import {
  getOrCreateKnowledgeBase,
  indexDocument,
  retrieveContext,
} from "../services/ragService.js";
import { createIndexIfNotExists } from "../services/pineconeService.js";

// Ensure Pinecone index exists on startup (non-blocking)
createIndexIfNotExists().catch((err) =>
  console.log("⚠️ Pinecone index init warning:", err.message)
);

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Every user gets one persistent knowledge base backing their Support
// Assistant, so previously uploaded PDFs stay searchable across questions
// without needing to be re-uploaded each time.
const SUPPORT_KB_NAME = "Support Assistant";

export const askQuestion = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { question, temperature = 0.7 } = req.body;
    const file = req.file;

    if (!question || question.trim().length === 0) {
      return res.json({
        success: false,
        message: "Question is required",
      });
    }

    const kbId = await getOrCreateKnowledgeBase(
      userId,
      SUPPORT_KB_NAME,
      "Documents uploaded to the Support Assistant"
    );

    let indexResult = null;
    if (file) {
      indexResult = await indexDocument(kbId, file);
    }

    // Retrieve the most relevant chunks from everything this user has ever
    // uploaded to the Support Assistant, not just the file from this request.
    const { context, sources } = await retrieveContext(kbId, question, 5);

    let finalPrompt = question;
    if (context) {
      finalPrompt = `Based on the following document excerpts:\n\n${context}\n\nPlease answer this question: ${question}`;
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature,
      max_tokens: 2000,
    });

    const generatedResponse = response.choices[0].message.content;

    // Save to support queries history
    await sql`
      INSERT INTO support_queries (id, user_id, question, response, document_name)
      VALUES (${uuidv4()}, ${userId}, ${question}, ${generatedResponse}, ${file?.originalname || null})
    `.catch(() => {
      // Table might not exist, continue anyway
    });

    res.json({
      success: true,
      message: "Response generated successfully",
      response: generatedResponse,
      used_rag: Boolean(context),
      sources: sources.length > 0 ? sources : null,
      document_indexed:
        indexResult && !indexResult.duplicate
          ? indexResult.chunks_created
          : undefined,
      document_already_indexed: indexResult?.duplicate || undefined,
    });
  } catch (error) {
    console.error("Error in support assistant:", error.message);
    res.json({ success: false, message: error.message });
  }
};
