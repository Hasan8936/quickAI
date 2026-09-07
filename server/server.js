import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import ragRouter from "./routes/ragRoutes.js";
import supportRouter from "./routes/supportRoutes.js";
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

// Use real Clerk auth whenever keys are configured, regardless of whether
// they're Clerk test-mode (sk_test_...) or live (sk_live_...) keys — both
// are real, working Clerk credentials. Only fall back to a mock user when
// no keys are configured at all (e.g. running the server with no .env).
const clerkConfigured = Boolean(
    process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY
);

if (clerkConfigured) {
    app.use(clerkMiddleware());
} else {
    // Mock auth middleware for local development without Clerk keys
    app.use((req, res, next) => {
        req.auth = () => ({ userId: 'test-user-id', has: async() => true });
        next();
    });
}

app.get("/", (req, res) => res.send("Server is Live!"));

// Only apply requireAuth if Clerk is actually configured and we're not running tests
if (process.env.NODE_ENV !== 'test' && clerkConfigured) {
    app.use(requireAuth());
}

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);
app.use("/api/rag", ragRouter);
app.use("/api/support", supportRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT} => http://localhost:${PORT} 🍽️`
    );
});