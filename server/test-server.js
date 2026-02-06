import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is Live!");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is healthy" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Test Server is running on http://localhost:${PORT}`);
});