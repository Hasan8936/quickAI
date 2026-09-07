# RAG Implementation Plan for QuickAI

## Overview
Adding Retrieval-Augmented Generation (RAG) capabilities to QuickAI to enable:
- 📚 Custom knowledge base management
- 🔍 Semantic document search
- 📝 Context-aware AI responses
- 💡 Improved content generation quality

---

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │   Express API         │
    ├──────────────────────┤
    │ New RAG Endpoints:   │
    │ • /upload-documents  │
    │ • /search-documents  │
    │ • /rag-generate      │
    └────┬─────────┬───────┘
         │         │
    ┌────▼─────┐  ┌─────────────────┐
    │PostgreSQL│  │ Vector Database │
    │(Existing)│  │ (Pinecone/etc)  │
    └──────────┘  └─────────────────┘
```

---

## Phase 1: Infrastructure Setup

### 1.1 Vector Database Selection
- **Option A (Recommended)**: Pinecone
  - Pros: Serverless, easy integration, generous free tier
  - Cons: Additional service to manage
  
- **Option B**: Supabase Vector (pgvector)
  - Pros: In PostgreSQL, single database
  - Cons: Self-managed indexing

**Decision**: Using **Pinecone** for scalability

### 1.2 Embedding Model
- **Using**: Google Generative AI Embeddings (consistent with existing Gemini usage)
- **Alternative**: OpenAI embeddings (768 dimensions)

### 1.3 Dependencies to Add
```json
{
  "pinecone-client": "^3.0.0",
  "@google/generative-ai": "^0.12.0",
  "langchain": "^0.2.0",
  "uuid": "^9.0.0"
}
```

---

## Phase 2: Database Schema Updates

### New Tables
```sql
-- Knowledge bases
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  kb_id UUID REFERENCES knowledge_bases(id),
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document chunks
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  doc_id UUID REFERENCES documents(id),
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER,
  vector_id TEXT (references Pinecone),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 3: Backend Implementation

### 3.1 New Controller: ragController.js
```
Functions:
- uploadDocuments()      - Handle document uploads and chunking
- createKnowledgeBase()  - Create user knowledge base
- searchDocuments()      - Semantic search
- generateWithRAG()      - Generate content using retrieved context
- deleteDocument()       - Remove documents and embeddings
```

### 3.2 New Routes: ragRoutes.js
```
POST   /api/rag/kb              - Create knowledge base
GET    /api/rag/kb              - List user's KBs
POST   /api/rag/upload          - Upload documents
DELETE /api/rag/documents/:id   - Delete document
POST   /api/rag/search          - Search documents
POST   /api/rag/generate        - RAG-augmented generation
```

### 3.3 Utilities
- `documentProcessor.js` - PDF/text chunking logic
- `embeddingService.js` - Embedding generation
- `pineconeService.js` - Vector DB operations

---

## Phase 4: Frontend Updates

### 4.1 New Components
- `KnowledgeBaseManager.jsx` - KB management UI
- `DocumentUploader.jsx` - Drag-drop file upload
- `RAGSearch.jsx` - Semantic search interface

### 4.2 New Pages
- `/knowledge-base` - Main KB management page

### 4.3 Integration Points
- Add RAG checkbox to existing generation tools
- Show retrieved sources in results

---

## Phase 5: Deployment

### 5.1 Environment Variables
```
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=xxx
GOOGLE_API_KEY=xxx (for embeddings)
```

### 5.2 Vercel Deployment
- Update backend env vars
- Update frontend env vars
- Test RAG endpoints

### 5.3 Database Migrations
- Run SQL schema updates on Neon

---

## Implementation Timeline

| Phase | Task | Status |
|-------|------|--------|
| 1 | Setup Pinecone account & get API key | 🔄 |
| 2 | Add dependencies | 🔄 |
| 3 | Create database schema | 🔄 |
| 4 | Implement RAG controller & routes | 🔄 |
| 5 | Frontend components | 🔄 |
| 6 | Integration testing | 🔄 |
| 7 | Deployment | 🔄 |

---

## Next Steps

1. Create Pinecone account
2. Get API keys
3. Implement Phase 2 & 3
4. Test locally
5. Deploy

---

Generated: 2025-09-07
