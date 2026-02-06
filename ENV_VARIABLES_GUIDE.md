# Environment Variables for Vercel Deployment
# Copy this to Vercel Dashboard Environment Variables section

## Backend (.env in Vercel Dashboard for server/)
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key_from_cloudinary
CLOUDINARY_API_SECRET=your_api_secret_from_cloudinary
GEMINI_API_KEY=your_google_gemini_api_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
NODE_ENV=production
```

## Frontend (.env in Vercel Dashboard for client/)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_API_URL=https://your-backend-project.vercel.app
VITE_NODE_ENV=production
```

## Where to Find Each Variable

### 1. Database URL (Neon PostgreSQL)
- Go to [neon.tech](https://neon.tech)
- Create/select project
- Copy connection string from Dashboard
- Format: `postgresql://user:password@host/database?sslmode=require`

### 2. Cloudinary Credentials
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up/login
- Go to Dashboard
- Find:
  - **CLOUD_NAME**: Under "API Environment variable"
  - **API_KEY**: Under "API Keys" section
  - **API_SECRET**: Under "API Keys" section

### 3. Gemini API Key
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create/select project
- Generate new API key
- Copy the key

### 4. Clerk Keys
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Select application
- Go to "API Keys"
- Find:
  - **PUBLISHABLE_KEY**: pk_live_xxxxx (public, safe to expose)
  - **SECRET_KEY**: sk_live_xxxxx (keep secret, only in backend)

### 5. Vercel Frontend URL
- After deploying server, note the URL from Vercel Dashboard
- Example: `https://quickai-server.vercel.app`

## How to Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Settings"
4. Go to "Environment Variables"
5. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Actual value
   - **Environment**: Production
6. Click "Save"
7. Redeploy for changes to take effect

## Testing Variables After Deployment

```bash
# Test API is accessible
curl https://your-backend.vercel.app/api/health

# Check logs for errors
vercel logs [project-name] --prod
```

## Security Notes

- ⚠️ NEVER commit `.env` files with real credentials
- ⚠️ NEVER share secret keys (API_SECRET, SK_LIVE_*, DATABASE passwords)
- ✅ Publish/public keys (like pk_live_*) are safe to expose in frontend .env
- ✅ Use Vercel's Environment Variables system for secrets, not .env files
- ✅ Regularly rotate API keys, especially if exposed
