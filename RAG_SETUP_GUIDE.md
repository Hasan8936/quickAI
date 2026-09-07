# RAG Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon)
- Pinecone account (free tier available)
- Google API credentials

---

## 📋 Step 1: Get API Keys

### 1.1 Pinecone Vector Database
1. Go to [pinecone.io](https://www.pinecone.io)
2. Sign up for free account
3. Create a serverless index named `quickai-rag`
4. Copy API Key and Environment

### 1.2 Google API (for embeddings)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key

### 1.3 Existing APIs (Already have)
- GEMINI_API_KEY (already configured)
- Database URL (Neon)
- Clerk credentials

---

## 🛠️ Step 2: Local Setup

### 2.1 Install Dependencies

```bash
# Navigate to server
cd server
npm install

# Navigate to client
cd ../client
npm install
```

### 2.2 Create Environment Variables

**Server/.env:**
```env
# Database
DATABASE_URL=your-neon-connection-string

# Authentication
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...

# APIs
GEMINI_API_KEY=your-gemini-key
GOOGLE_API_KEY=your-google-api-key

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Server
PORT=3000
NODE_ENV=development
```

**Client/.env:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:3000
```

### 2.3 Setup Database

```bash
# Connect to your Neon database and run the migration:
# Copy contents of: server/migrations/001_create_rag_tables.sql
# Run in Neon dashboard or psql
```

### 2.4 Start Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run server

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2.5 Test RAG Functionality

Navigate to:
- Knowledge Base Manager: `http://localhost:5173/kb`
- RAG Generator: `http://localhost:5173/rag`

---

## 📤 Step 3: Deployment (Vercel + Neon)

### 3.1 Prepare Repository

```bash
git add .
git commit -m "Add RAG capabilities to QuickAI"
git push origin main
```

### 3.2 Deploy Backend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select `server` as root directory
4. Add environment variables:
   - All from your `.env` file
5. Deploy

**Note:** Copy the deployment URL (e.g., `https://quickai-server.vercel.app`)

### 3.3 Deploy Frontend (Vercel)

1. Create new Vercel project
2. Select `client` as root directory
3. Set environment variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   VITE_API_BASE_URL=https://quickai-server.vercel.app
   ```
4. Deploy

### 3.4 Database Migration (Production)

1. Go to Neon console
2. Execute the SQL from `server/migrations/001_create_rag_tables.sql`

---

## 🧪 Testing RAG Features

### Test 1: Create Knowledge Base
```bash
curl -X POST http://localhost:3000/api/rag/kb \
  -H "Content-Type: application/json" \
  -d '{"name":"Test KB","description":"Test"}'
```

### Test 2: Upload Document
```bash
curl -X POST http://localhost:3000/api/rag/upload \
  -F "document=@test.pdf" \
  -F "kb_id=your-kb-id"
```

### Test 3: Search Documents
```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"your-kb-id","query":"test query"}'
```

### Test 4: Generate with RAG
```bash
curl -X POST http://localhost:3000/api/rag/generate \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"your-kb-id","prompt":"Your prompt","use_rag":true}'
```

---

## 📊 API Endpoints Reference

### Knowledge Base
- `POST /api/rag/kb` - Create KB
- `GET /api/rag/kb` - List KBs
- `GET /api/rag/kb/:kb_id/stats` - Get KB statistics

### Documents
- `POST /api/rag/upload` - Upload document
- `DELETE /api/rag/documents/:doc_id` - Delete document

### Search & Generation
- `POST /api/rag/search` - Search documents
- `POST /api/rag/generate` - Generate with RAG

---

## 🔧 Troubleshooting

### Issue: Pinecone connection fails
**Solution:** Verify API key and environment variable name

### Issue: Embeddings generation slow
**Solution:** This is normal for first-time embeddings. Consider batch processing.

### Issue: Database connection error
**Solution:** Check `DATABASE_URL` format matches Neon requirements

### Issue: Frontend can't reach backend
**Solution:** Verify `VITE_API_BASE_URL` matches deployed backend URL

---

## 📝 Project Structure

```
quickAI/
├── server/
│   ├── controllers/
│   │   └── ragController.js
│   ├── services/
│   │   ├── pineconeService.js
│   │   ├── embeddingService.js
│   │   └── documentProcessor.js
│   ├── routes/
│   │   └── ragRoutes.js
│   └── migrations/
│       └── 001_create_rag_tables.sql
├── client/
│   └── src/components/
│       ├── KnowledgeBaseManager.jsx
│       └── RAGGenerator.jsx
└── RAG_IMPLEMENTATION_PLAN.md
```

---

## 🚨 Important Notes

1. **Costs:**
   - Pinecone: Free tier includes 1M vectors
   - Google API: Check pricing for embeddings
   - Database: Scale as needed

2. **Security:**
   - Never commit `.env` files
   - Use Vercel environment variable management
   - Enable database encryption

3. **Performance:**
   - Embeddings take ~100-200ms per request
   - Vector search is fast (<100ms)
   - Consider caching for frequently accessed results

---

## 📚 Additional Resources

- [Pinecone Docs](https://docs.pinecone.io)
- [Google Generative AI](https://ai.google.dev)
- [Vercel Deployment](https://vercel.com/docs)
- [LangChain Integration](https://js.langchain.com)

---

## ✅ Deployment Checklist

- [ ] All API keys obtained
- [ ] Environment variables configured
- [ ] Database migration applied
- [ ] Local testing completed
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Production environment variables set
- [ ] RAG endpoints tested in production
- [ ] Knowledge base creation tested
- [ ] Document upload tested
- [ ] Search functionality verified
- [ ] Generation with RAG working

---

Generated: 2025-09-07
