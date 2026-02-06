# QuickAI - Quick Start Guide 🚀

## 📌 Current Status
✅ **Both servers are running and ready for testing!**

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Running |
| Backend API | http://localhost:3000 | ✅ Running |

---

## 🎯 Immediate Actions

### 1. Open the Application
Simply navigate to **http://localhost:5173** in your browser to see the QuickAI interface.

### 2. Check API Status
```bash
# In another terminal, test the server:
curl http://localhost:3000
# Expected response: "Server is Live!"
```

### 3. Watch for Changes
- **Frontend:** Changes to React files auto-reload thanks to Vite
- **Backend:** Changes to server code auto-reload thanks to nodemon

---

## 📂 Where Things Are Located

### Backend Server
```
server/
├── .env                              # Configuration file ✅
├── server.js                         # Main server entry point
├── routes/
│   ├── aiRoutes.js                   # AI endpoints
│   └── userRoutes.js                 # User endpoints
└── controllers/
    ├── aiController.js               # AI logic
    └── userController.js             # User logic
```

**Running on:** http://localhost:3000

### Frontend Application
```
client/
├── .env                              # Configuration ✅
├── src/
│   ├── pages/                        # Route pages (Dashboard, Community, etc.)
│   ├── components/                   # React components
│   └── App.jsx                       # Main app component
└── dist/                             # Build output
```

**Running on:** http://localhost:5173

---

## 🧪 What You Can Test

### ✅ Already Working
- [x] Server startup
- [x] Client build
- [x] Hot reload on code changes
- [x] UI components rendering
- [x] Routing setup
- [x] Clerk authentication integration (configured)

### ⚠️ Requires Real Credentials
- [ ] Database connections
- [ ] AI text/image generation
- [ ] Image processing (background removal, object removal)
- [ ] File uploads (resume review)
- [ ] User authentication (with real Clerk keys)

---

## 🔑 Required Credentials to Add

To fully test the application, update the `.env` files:

### Server `.env` (`server/.env`)
```
DATABASE_URL=<your-neon-db-url>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
GEMINI_API_KEY=<your-gemini-key>
CLERK_SECRET_KEY=<your-clerk-secret>
```

### Client `.env` (`client/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-public-key>
```

**Get credentials from:**
- Neon PostgreSQL: https://console.neon.tech
- Cloudinary: https://cloudinary.com
- Google Gemini: https://aistudio.google.com/app/apikeys
- Clerk: https://dashboard.clerk.com

---

## 🛠️ Terminal Commands

### Start Everything
```bash
# Terminal 1 - Start backend
cd server
npm run server

# Terminal 2 - Start frontend
cd client
npm run dev
```

### Stop Servers
```
Ctrl + C in each terminal
```

### Check Code Quality
```bash
cd client
npm run lint            # Check for issues
npm run lint -- --fix   # Auto-fix issues
```

### Build for Production
```bash
cd client
npm run build           # Creates dist/ folder
npm run preview         # Preview production build
```

---

## 🔍 Testing Workflow

### 1. Frontend Testing
```
http://localhost:5173
- Browse all pages
- Check responsive design
- Test navigation
- Try clicking buttons (won't work fully without real credentials)
```

### 2. API Testing (with curl)
```bash
# Test if server is running
curl http://localhost:3000

# Test protected API (requires Clerk token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/user/get-user-creations
```

### 3. Code Quality Testing
```bash
cd client
npm run lint  # Should show: 0 errors, 0 warnings
```

---

## 📊 Project Overview

**QuickAI** - AI-Powered Content Generation Platform

### Features:
- 📝 Write articles with AI
- 📰 Generate blog titles
- 🎨 Generate images
- 🖼️ Remove image backgrounds
- 🎯 Remove objects from images
- 📄 Review resumes
- 👥 Community sharing
- 📊 User dashboard

### Tech Stack:
- **Frontend:** React 19, Vite 7, Tailwind CSS
- **Backend:** Express 5, Node.js
- **Database:** PostgreSQL (Neon)
- **Auth:** Clerk
- **Image Processing:** Cloudinary
- **AI:** Google Gemini / OpenAI

---

## 🐛 Debugging Tips

### Server Issues
- Check port 3000 is available
- Look at terminal output for error messages
- Check `.env` file for typos

### Client Issues
- Check browser console (F12)
- Network tab shows API calls
- Check terminal for Vite errors
- Clear browser cache if needed

### API Connection Issues
- Verify both servers are running
- Check `VITE_API_URL` in client `.env`
- Check CORS configuration in server
- Look at Network tab in DevTools

---

## 📝 File Modifications Done

### Fixed Issues:
1. ✅ ESLint errors in components (Sidebar.jsx, Community.jsx, Dashboard.jsx)
2. ✅ React Hook dependencies warnings
3. ✅ Created `.env` files for both server and client

### Current State:
- ESLint: **0 errors, 0 warnings** ✅
- Build: **Successful** ✅
- Server: **Running** ✅
- Client: **Running** ✅

---

## 🚀 Next Steps

1. **Explore the UI** - Navigate to http://localhost:5173
2. **Get API Credentials** - Sign up for Neon, Cloudinary, Gemini, Clerk
3. **Update `.env` files** - Add real credentials
4. **Test Features** - Try creating articles, images, etc.
5. **Check Logs** - Watch terminal for any issues
6. **Debug as Needed** - Use browser DevTools and console

---

## 📞 Quick Reference

| What | Where | URL |
|------|-------|-----|
| Frontend App | Browser | http://localhost:5173 |
| Server Health | curl | http://localhost:3000 |
| Backend Code | `server/` folder | — |
| Frontend Code | `client/src/` folder | — |
| Documentation | `LOCAL_TEST_SETUP.md` | — |

---

## ✨ You're All Set!

The environment is configured and both servers are running. Open **http://localhost:5173** and start testing! 

For full functionality, add your real API credentials to the `.env` files and restart the servers.

**Happy Testing! 🎉**
