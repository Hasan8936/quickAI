import { v4 as uuidv4 } from "uuid";
import sql from "../configs/db.js";
import OpenAI from "openai";
import { processDocument } from "../services/documentProcessor.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

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

    let documentContent = "";

    // Process uploaded document if provided
    if (file) {
      const processed = await processDocument(file.buffer, file.originalname);
      documentContent = processed.content;
    }

    // Build the prompt
    let finalPrompt = question;
    if (documentContent) {
      finalPrompt = `Based on the following document content:\n\n${documentContent}\n\nPlease answer this question: ${question}`;
    }

    // Generate response using Gemini
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
    });
  } catch (error) {
    console.error("Error in support assistant:", error.message);
    res.json({ success: false, message: error.message });
  }
};
