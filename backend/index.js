import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Your React frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/audios", audioRoutes);
app.use("/api/pdfs", pdfRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
