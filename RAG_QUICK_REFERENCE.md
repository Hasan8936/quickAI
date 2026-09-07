# RAG Quick Reference Card

## 🚀 30-Second Setup

```bash
# 1. Get API Keys
# - Pinecone: https://www.pinecone.io (free)
# - Google: https://makersuite.google.com/app/apikey

# 2. Install dependencies
npm install

# 3. Set environment variables
cp server/.env.example server/.env
# Edit .env with your keys

# 4. Run migration on Neon
# Copy: server/migrations/001_create_rag_tables.sql

# 5. Start local servers
npm run server (terminal 1)
npm run dev (terminal 2)

# 6. Deploy
git push origin main
# Vercel auto-deploys
```

---

## 🔌 API Quick Reference

### Create Knowledge Base
```bash
POST /api/rag/kb
{
  "name": "My KB",
  "description": "Optional desc"
}
```

### Upload Document
```bash
POST /api/rag/upload
multipart/form-data:
  - document: file.pdf
  - kb_id: uuid
```

### Search Documents
```bash
POST /api/rag/search
{
  "kb_id": "uuid",
  "query": "search text",
  "top_k": 5
}
```

### Generate with RAG
```bash
POST /api/rag/generate
{
  "kb_id": "uuid",
  "prompt": "your prompt",
  "use_rag": true,
  "temperature": 0.7
}
```

---

## 📋 Deployment Checklist

```
Pre-Deploy
☐ Pinecone account created
☐ Google API key obtained
☐ All .env variables set
☐ Local tests passed

Deploy Backend
☐ Push to GitHub
☐ Vercel auto-deploys
☐ Copy deployment URL

Deploy Frontend
☐ Set VITE_API_BASE_URL to backend URL
☐ Deploy to Vercel

Post-Deploy
☐ Run database migration on Neon
☐ Test all endpoints
☐ Verify RAG search works
☐ Check source attribution
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Pinecone 401 | Check API key spelling |
| Google API timeout | Verify API key enabled |
| DB connection fails | Check DATABASE_URL format |
| API unreachable | Check VITE_API_BASE_URL |
| Upload fails | File < 10MB, PDF/TXT only |
| No search results | Ensure docs are uploaded |

---

## 📊 File Structure

```
server/
├── controllers/ragController.js     (7 functions)
├── services/
│   ├── pineconeService.js           (vector ops)
│   ├── embeddingService.js          (embeddings)
│   └── documentProcessor.js         (chunking)
├── routes/ragRoutes.js              (endpoints)
└── migrations/001_create_rag_tables.sql

client/
└── src/components/
    ├── KnowledgeBaseManager.jsx     (UI)
    └── RAGGenerator.jsx             (generation)
```

---

## 🔑 Environment Variables

```bash
# Pinecone
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1-aws

# Google
GOOGLE_API_KEY=xxx
GEMINI_API_KEY=xxx

# Database
DATABASE_URL=postgres://...

# Clerk
CLERK_SECRET_KEY=xxx
CLERK_PUBLISHABLE_KEY=xxx

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=xxx
```

---

## 💡 Key Features

✨ **Knowledge Bases** - Multiple docs per user
✨ **Semantic Search** - Find by meaning, not keywords
✨ **RAG Generation** - Answers from your docs
✨ **Source Attribution** - See which docs were used
✨ **User Isolation** - Docs private to user

---

## 📈 Limits & Costs

| Item | Limit | Cost |
|------|-------|------|
| Vector index | 1M (free) | ~$50/extra 1M |
| Document size | 10MB | N/A |
| Chunk tokens | 500 | N/A |
| Embeddings/mo | ~10k | ~$2-5 |
| Database | Neon plan | $0-100/mo |

---

## 🧪 Test Endpoints

```bash
# Test KB creation
curl -X POST http://localhost:3000/api/rag/kb \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Test search
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"xxx","query":"test"}'

# Test generation
curl -X POST http://localhost:3000/api/rag/generate \
  -H "Content-Type: application/json" \
  -d '{"kb_id":"xxx","prompt":"test","use_rag":true}'
```

---

## 📞 Resources

- **Setup:** RAG_SETUP_GUIDE.md
- **Deploy:** DEPLOYMENT_STEPS.md
- **Arch:** RAG_IMPLEMENTATION_PLAN.md
- **Summary:** RAG_IMPLEMENTATION_SUMMARY.md
- **Pinecone:** https://docs.pinecone.io
- **Google API:** https://ai.google.dev

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Can create knowledge base
- [ ] Can upload PDF/TXT
- [ ] Can search documents
- [ ] Can generate with RAG
- [ ] Sources are returned
- [ ] No errors in logs
- [ ] Response time < 5s

---

**Last Updated:** Sept 7, 2025
**Status:** Ready to Deploy ✅
