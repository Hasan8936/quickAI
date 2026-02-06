# Vercel Deployment Guide - QuickAI

This guide will help you deploy the QuickAI full-stack application to Vercel.

## Architecture Overview

- **Frontend**: React + Vite → Deployed as Vercel Static Site
- **Backend**: Express.js → Deployed as Vercel Serverless Functions
- **Database**: PostgreSQL (Neon) → Cloud-hosted
- **Storage**: Cloudinary → Cloud-hosted

## Prerequisites

1. **Vercel Account** - Create at [vercel.com](https://vercel.com)
2. **GitHub Account** - Project should be pushed to GitHub
3. **Environment Variables** - Have all credentials ready:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
   - `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`

## Step 1: Push Project to GitHub

```bash
git init
git add .
git commit -m "Initial QuickAI deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quickai.git
git push -u origin main
```

## Step 2: Deploy Backend to Vercel

### Option A: Deploy Server as Separate Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Under "Configure Project":
   - **Root Directory**: `server`
   - **Build Command**: `npm install` (or leave blank)
   - **Output Directory**: Leave blank (Node.js projects)
   - **Install Command**: `npm install`

4. Add Environment Variables in Vercel Dashboard:
   ```
   DATABASE_URL=your_neon_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_key
   CLERK_SECRET_KEY=your_clerk_secret
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable
   NODE_ENV=production
   ```

5. Click "Deploy"

**After deployment, note the Backend URL** (e.g., `https://quickai-backend.vercel.app`)

### Option B: Deploy Monorepo (Recommended)

If deploying both from one repo:
1. Create a `vercel.json` in root:
   ```json
   {
     "projects": {
       "server": { "path": "server" },
       "client": { "path": "client" }
     }
   }
   ```

2. Deploy once, Vercel will auto-detect both projects

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Under "Configure Project":
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable
   VITE_API_URL=https://quickai-backend.vercel.app
   VITE_NODE_ENV=production
   ```

5. Click "Deploy"

## Step 4: Update API Configuration

After both are deployed, update the frontend `.env` in Vercel:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

This ensures the frontend API calls go to your backend serverless functions.

## File Structure for Vercel

```
QuickAI/
├── client/
│   ├── vercel.json          # Frontend config
│   ├── vite.config.js
│   ├── package.json
│   └── src/
├── server/
│   ├── vercel.json          # Backend config
│   ├── server.js
│   ├── package.json
│   └── routes/
└── vercel.json              # Root config (if monorepo)
```

## Environment Variables Required

### Server (.env)

```
DATABASE_URL=postgresql://user:password@host/db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
PORT=3000
NODE_ENV=production
```

### Client (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=https://your-backend.vercel.app
VITE_NODE_ENV=production
```

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Backend deployed (note the URL)
- [ ] Frontend deployed with correct API URL
- [ ] Clerk authentication working
- [ ] Database connection verified
- [ ] Cloudinary integration active
- [ ] API endpoints responding (test in browser)
- [ ] Frontend loads and connects to backend

## Verification Steps

1. **Test Frontend**: Visit your Vercel frontend URL
2. **Test Backend**: Visit `https://your-backend.vercel.app/`
3. **Check Console**: Look for errors in browser DevTools
4. **Test API Call**: 
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

## Common Issues & Solutions

### CORS Errors
- **Problem**: Frontend can't reach backend
- **Solution**: Ensure CORS is enabled in `server/server.js` and `VITE_API_URL` is correct

### Environment Variables Not Loading
- **Problem**: 500 errors on API calls
- **Solution**: 
  - Verify all env vars are set in Vercel Dashboard
  - Check spelling and format match
  - Redeploy after adding env vars

### Build Failures
- **Problem**: Deployment fails during build
- **Solution**:
  - Check terminal output for errors
  - Ensure `package.json` has correct build scripts
  - Verify all dependencies are listed

### Authentication Issues
- **Problem**: Clerk errors or login not working
- **Solution**:
  - Verify Clerk keys are correct
  - Add Vercel domain to Clerk Allowlist
  - Check Clerk dashboard for API errors

## Scaling Considerations

- **Database**: Neon PostgreSQL auto-scales; upgrade plan if needed
- **Storage**: Cloudinary handles image processing; monitor usage
- **Functions**: Vercel serverless functions scale automatically
- **CDN**: Vercel includes global CDN for frontend assets

## Monitoring

1. **Vercel Dashboard**: Monitor deployment status and logs
2. **Logs**:
   ```bash
   vercel logs [project-name]
   ```
3. **Analytics**: Check Vercel analytics for performance metrics

## Rollback

If something goes wrong:
1. Go to Vercel Dashboard → Project → Deployments
2. Find previous successful deployment
3. Click "Rollback to this deployment"

## Next Steps

After successful deployment:
1. Set up custom domain
2. Enable automatic deployments on GitHub push
3. Configure performance monitoring
4. Set up CI/CD pipeline
5. Monitor error logs regularly

---

For more help, visit [Vercel Docs](https://vercel.com/docs)
