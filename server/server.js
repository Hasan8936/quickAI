import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// Initialize Cloudinary in background without blocking
try {
    await connectCloudinary().catch(err => {
        console.log("⚠️ Cloudinary initialization warning (non-blocking):", err.message);
    });
} catch (err) {
    console.log("⚠️ Cloudinary init skipped for development");
}

app.use(cors());
app.use(express.json());

// Only use Clerk middleware if CLERK_SECRET_KEY is properly configured
if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY &&
    !process.env.CLERK_SECRET_KEY.includes('test') && !process.env.CLERK_SECRET_KEY.includes('local')) {
    app.use(clerkMiddleware());
} else {
    // Mock auth middleware for development/testing
    app.use((req, res, next) => {
        req.auth = () => ({ userId: 'test-user-id', has: async() => true });
        next();
    });
}

app.get("/", (req, res) => res.send("Server is Live!"));

// Only apply requireAuth if not in test mode
if (process.env.NODE_ENV !== 'test' && process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes('test')) {
    app.use(requireAuth());
}

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
    );
});