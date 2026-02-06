import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import aiRouter from '../server/routes/aiRoutes.js';
import userRouter from '../server/routes/userRoutes.js';
import connectCloudinary from '../server/configs/cloudinary.js';

const app = express();

// Initialize Cloudinary
try {
    await connectCloudinary().catch(err => {
        console.log('⚠️ Cloudinary warning:', err.message);
    });
} catch (err) {
    console.log('⚠️ Cloudinary skipped');
}

app.use(cors());
app.use(express.json());

// Clerk middleware
if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes('test')) {
    app.use(clerkMiddleware());
}

// Routes
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ message: 'QuickAI Server Running' });
});

export default app;