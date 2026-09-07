# QuickAI RAG - Deployment Steps (2025-09-07)

## 🎯 What Was Added

### Backend Services
- ✅ Pinecone integration for vector storage
- ✅ Google Generative AI embeddings
- ✅ Document processing & chunking
- ✅ RAG controller with full CRUD operations
- ✅ Database schema for RAG tables

### API Endpoints
```
POST   /api/rag/kb              - Create knowledge base
GET    /api/rag/kb              - List knowledge bases  
GET    /api/rag/kb/:id/stats    - Get KB statistics
POST   /api/rag/upload          - Upload documents
DELETE /api/rag/documents/:id   - Delete document
POST   /api/rag/search          - Semantic search
POST   /api/rag/generate        - RAG-powered generation
```

### Frontend Components
- ✅ `KnowledgeBaseManager.jsx` - KB & document management
- ✅ `RAGGenerator.jsx` - Content generation with RAG

### Database Tables
- `knowledge_bases` - User knowledge bases
- `documents` - Uploaded documents
- `document_chunks` - Text chunks with embeddings
- `rag_queries` - Query history

---

## 📋 Pre-Deployment Checklist

### 1. Get Required API Keys

**Pinecone (Vector Database)**
- [ ] Go to https://www.pinecone.io
- [ ] Sign up (free tier: 1M vectors)
- [ ] Create serverless index: `quickai-rag`
- [ ] Copy API Key
- [ ] Copy Environment (e.g., `us-east-1-aws`)

**Google API (Embeddings)**
- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Create API Key
- [ ] Enable "Generative Language API"

**Existing (Already Have)**
- [ ] GEMINI_API_KEY
- [ ] DATABASE_URL (Neon)
- [ ] CLERK_SECRET_KEY & CLERK_PUBLISHABLE_KEY
- [ ] CLOUDINARY credentials

---

## 🔧 Local Testing (Before Deployment)

### 1. Install Dependencies
```bash
cd quickAI-rag/server
npm install

cd ../client
npm install
```

### 2. Configure Environment
```bash
cd server
# Create .env file with:
DATABASE_URL=your_neon_url
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_google_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
PORT=3000
NODE_ENV=development
```

### 3. Run Database Migration
```bash
# Connect to Neon and execute:
# server/migrations/001_create_rag_tables.sql
```

### 4. Start Development Servers
```bash
# Terminal 1
cd server && npm run server

# Terminal 2
cd client && npm run dev
```

### 5. Test RAG Features
- Create knowledge base at `http://localhost:5173`
- Upload a PDF or TXT file
- Test semantic search
- Test RAG generation

---

## 🚀 Production Deployment

### Phase 1: Backend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   cd quickAI-rag
   git add .
   git commit -m "Add RAG capabilities"
   git push origin main
   ```

2. **Deploy Server**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Set root directory: `server`
   - Add environment variables (same as .env)
   - Click "Deploy"
   - **Note:** Copy the deployment URL

3. **Deploy Client**
   - Create another Vercel project
   - Set root directory: `client`
   - Set environment variables:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
     VITE_API_BASE_URL=https://your-deployed-server-url
     ```
   - Deploy

### Phase 2: Database Migrations

1. **Connect to Neon Production Database**
   - Go to https://neon.tech
   - Open your project
   - Go to SQL Editor

2. **Run Migration**
   - Copy entire SQL from `server/migrations/001_create_rag_tables.sql`
   - Paste into Neon SQL Editor
   - Execute

### Phase 3: Verification

1. **Test Knowledge Base Creation**
   ```bash
   curl -X POST https://your-server-url/api/rag/kb \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-clerk-token" \
     -d '{"name":"Test KB"}'
   ```

2. **Test Document Upload**
   - Upload test PDF via UI

3. **Test Search**
   - Create KB → Upload doc → Search

4. **Test RAG Generation**
   - Use RAG Generator component
   - Verify sources are returned

---

## 📊 Environment Variables Summary

### Server (.env)
```
DATABASE_URL=postgresql://...@neon.tech:5432/...
GEMINI_API_KEY=your-gemini-key
GOOGLE_API_KEY=your-google-key
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1-aws
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
PORT=3000
NODE_ENV=production
```

### Client (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_BASE_URL=https://your-deployed-server-url.vercel.app
```

---

## 🧪 Post-Deployment Testing

### Test Case 1: Create KB
```bash
curl -X POST https://api.quickai.com/api/rag/kb \
  -H "Content-Type: application/json" \
  -d '{"name":"Company Docs","description":"Internal docs"}'
```

### Test Case 2: Upload Document
```bash
curl -X POST https://api.quickai.com/api/rag/upload \
  -F "document=@manual.pdf" \
  -F "kb_id=kb-id-here"
```

### Test Case 3: Semantic Search
```bash
curl -X POST https://api.quickai.com/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"kb-id","query":"How to setup?","top_k":5}'
```

### Test Case 4: RAG Generation
```bash
curl -X POST https://api.quickai.com/api/rag/generate \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"kb-id","prompt":"Summarize the docs","use_rag":true}'
```

---

## 🎓 Next Steps for Users

1. **Integrate RAG into Existing Tools**
   - Add RAG option to article generator
   - Add RAG option to blog title generator
   - Add RAG option to resume reviewer

2. **Advanced Features**
   - Batch document processing
   - Multi-language support
   - Custom embedding models
   - Query result caching

3. **Monitoring**
   - Set up logging for API usage
   - Monitor Pinecone usage
   - Track embedding costs
   - Monitor database growth

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Pinecone 401 error | Check API key and environment variable spelling |
| Embeddings timeout | Google API key might be invalid, check limits |
| Database connection fails | Verify DATABASE_URL format from Neon |
| Frontend can't reach backend | Check VITE_API_BASE_URL matches deployed server |
| Upload fails | Check file size < 10MB, format is PDF/TXT |
| Search returns empty | Ensure documents are uploaded and indexed |

---

## 📞 Support

- **Pinecone Issues:** https://docs.pinecone.io
- **Google API Issues:** https://ai.google.dev
- **Vercel Issues:** https://vercel.com/support
- **Database Issues:** https://neon.tech/docs

---

## ✅ Final Checklist Before Going Live

- [ ] All API keys obtained and configured
- [ ] Local testing passed (all 4 test cases)
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Database migration applied
- [ ] Environment variables set in Vercel
- [ ] Production endpoints tested
- [ ] RAG search works
- [ ] RAG generation works
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Users informed about new features

---

**Status:** ✅ Ready for deployment
**Date:** 2025-09-07
