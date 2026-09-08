import express from "express";
import multer from "multer";
import {
  createKnowledgeBase,
  listKnowledgeBases,
  uploadDocument,
  searchDocuments,
  deleteDocument,
  getKnowledgeBaseStats,
} from "../controllers/ragController.js";

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "text/plain"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Knowledge Base Routes
router.post("/kb", createKnowledgeBase);
router.get("/kb", listKnowledgeBases);
router.get("/kb/:kb_id/stats", getKnowledgeBaseStats);

// Document Routes
router.post("/upload", upload.single("document"), uploadDocument);
router.delete("/documents/:doc_id", deleteDocument);

// Search Routes
router.post("/search", searchDocuments);

export default router;
