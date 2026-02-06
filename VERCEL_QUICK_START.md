# Quick Start: Deploy to Vercel in 5 Minutes

## Prerequisites Checklist
- [ ] GitHub account with repo created
- [ ] Vercel account (free tier available)
- [ ] All environment variables ready:
  - [ ] Neon Database URL
  - [ ] Cloudinary credentials (3 values)
  - [ ] Gemini API key
  - [ ] Clerk keys (2 values)

## One-Command Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Backend
```bash
cd server
vercel --prod --env-file ../.env
```

### Step 4: Get Backend URL
After deployment, note the URL shown (e.g., `https://quickai-server-xxx.vercel.app`)

### Step 5: Update Frontend URL
Edit `.env.production` in client or set in Vercel Dashboard:
```
VITE_API_URL=https://your-backend-url.vercel.app
```

### Step 6: Deploy Frontend
```bash
cd ../client
vercel --prod --env-file ../.env
```

## Or Use Vercel Dashboard (Easiest)

1. **Push to GitHub first**:
   ```bash
   git push origin main
   ```

2. **Go to [vercel.com/new](https://vercel.com/new)**

3. **Import Repository**:
   - Select your GitHub repo
   - Click "Import"

4. **Configure Project**:
   - Framework: `Vite` (for frontend)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `client` (leave blank for auto-detect)

5. **Add Environment Variables**:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=xxx
   VITE_API_URL=https://your-backend.vercel.app
   VITE_NODE_ENV=production
   ```

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-5 minutes
   - Get your live URL

## Deploy Backend Separately

Repeat the same process for the `server` folder:
- Select repository again
- Set Root Directory to `server`
- Build Command: `npm install`
- Add server environment variables

## Verify Deployment

After both deployments:

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend API**:
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```
3. **Check Logs**:
   ```bash
   vercel logs --prod
   ```

## Troubleshooting

### Build Fails
- Check `package.json` scripts
- Verify Node version compatibility
- Check error logs in Vercel Dashboard

### API Connection Issues
- Verify `VITE_API_URL` is correct and matches backend URL
- Check CORS is enabled in server
- Check environment variables are set

### Authentication Issues
- Verify Clerk keys in Vercel env vars
- Add Vercel domain to Clerk Allowlist
- Restart deployment after adding keys

## Continuous Deployment

After initial deployment, every `git push` to main automatically triggers a new deployment!

## Production Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loads
- [ ] API calls working (check browser console)
- [ ] Clerk authentication working
- [ ] Image uploads working
- [ ] Database queries working
- [ ] No console errors in browser
- [ ] All environment variables set
- [ ] Custom domain configured (optional)

---

**Need more help?** See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.
