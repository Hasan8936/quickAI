# QuickAI Vercel Deployment - Complete Setup

Your project is now ready for Vercel deployment! Here's everything you need:

## 📁 Files Created for Deployment

```
QuickAI-main/
├── VERCEL_QUICK_START.md              ← START HERE (5-minute guide)
├── VERCEL_DEPLOYMENT_GUIDE.md          ← Detailed step-by-step guide
├── ENV_VARIABLES_GUIDE.md              ← Where to find all credentials
├── VERCEL_DEPLOYMENT_CHECKLIST.sh      ← Interactive checklist
├── server/vercel.json                  ← Updated for production
├── client/vercel.json                  ← Already configured
└── api/handler.js                      ← Optional serverless API
```

## ⚡ 5-Minute Quick Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "QuickAI for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quickai.git
git push -u origin main
```

### 2. Deploy Backend
- Go to https://vercel.com/new
- Import your repository
- Set Root Directory: `server`
- Add environment variables (see ENV_VARIABLES_GUIDE.md)
- Click Deploy
- **Copy the URL** (e.g., https://quickai-server.vercel.app)

### 3. Deploy Frontend
- Go to https://vercel.com/new again
- Same repository
- Set Root Directory: `client`
- Add env variables including `VITE_API_URL` = your backend URL
- Click Deploy

### 4. Done! 🎉
- Frontend live at: https://your-frontend.vercel.app
- Backend live at: https://your-backend.vercel.app

## 📋 Environment Variables Needed

### Backend (server/)
```
DATABASE_URL              (Neon PostgreSQL)
CLOUDINARY_CLOUD_NAME     (Cloudinary)
CLOUDINARY_API_KEY        (Cloudinary)
CLOUDINARY_API_SECRET     (Cloudinary)
GEMINI_API_KEY            (Google)
CLERK_SECRET_KEY          (Clerk)
CLERK_PUBLISHABLE_KEY     (Clerk)
NODE_ENV=production
```

### Frontend (client/)
```
VITE_CLERK_PUBLISHABLE_KEY    (Clerk)
VITE_API_URL                  (Your Backend URL)
VITE_NODE_ENV=production
```

## 🔗 Get Your Credentials From

| Service | Link | What to Get |
|---------|------|-----------|
| **Database** | [neon.tech](https://neon.tech) | PostgreSQL connection string |
| **Images** | [cloudinary.com](https://cloudinary.com/console) | Cloud name, API key, secret |
| **AI** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Gemini API key |
| **Auth** | [dashboard.clerk.com](https://dashboard.clerk.com) | Publishable & Secret keys |

## ✅ Deployment Architecture

```
User Browser
     ↓
┌─────────────────────────────────┐
│ Frontend (Vercel Static)         │
│ React + Vite → dist/            │
│ quickai-xxx.vercel.app          │
└────────────────┬────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────┐
│ Backend (Vercel Serverless)      │
│ Express.js → /api/routes        │
│ quickai-server-xxx.vercel.app   │
└────────┬────────────┬───────────┘
         │            │
    Database      Storage
    Neon DB     Cloudinary
```

## 🚀 Key Features Ready

- ✅ **Automated Deploys**: Every git push = auto-deployment
- ✅ **Global CDN**: Fast delivery worldwide
- ✅ **Serverless**: Auto-scales with traffic
- ✅ **SSL/HTTPS**: Free SSL certificate
- ✅ **Environment Isolation**: Dev/staging/production
- ✅ **One-Click Rollback**: Revert to previous version anytime

## 📊 Project Structure for Vercel

```
QuickAI/
├── client/                  ← Frontend (deploy separately)
│   ├── package.json
│   ├── vercel.json
│   ├── vite.config.js
│   └── src/
├── server/                  ← Backend (deploy separately)
│   ├── package.json
│   ├── vercel.json
│   ├── server.js
│   └── routes/
├── VERCEL_QUICK_START.md
├── VERCEL_DEPLOYMENT_GUIDE.md
└── ENV_VARIABLES_GUIDE.md
```

## 🔧 After Deployment

### Monitor Your Application
```bash
# View logs
vercel logs [project-name] --prod

# Check environment variables
vercel env list

# Redeploy latest
vercel deploy --prod
```

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (myapp.com)
3. Update DNS records
4. Vercel handles SSL automatically

### Auto-Deployments
After the first deployment, every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Automatically deploys to Vercel in 2-3 minutes!

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check logs in Vercel Dashboard |
| API 404 errors | Verify VITE_API_URL matches backend URL |
| Auth not working | Check Clerk keys are correct in env vars |
| CORS errors | Backend CORS middleware is enabled |
| Database errors | Verify DATABASE_URL is correct |
| Image upload fails | Check Cloudinary credentials |

## 📞 Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev
- **Clerk Docs**: https://clerk.com/docs

## 📝 Next Steps

1. **Read**: `VERCEL_QUICK_START.md` (5 min read)
2. **Prepare**: Gather all environment variables
3. **Deploy Backend**: Push server/ to Vercel
4. **Deploy Frontend**: Push client/ to Vercel with backend URL
5. **Test**: Open your frontend URL and verify everything works
6. **Share**: Your app is now live online!

---

**Questions?** Check the detailed guides in this folder or visit Vercel documentation.

**Happy deploying! 🚀**
