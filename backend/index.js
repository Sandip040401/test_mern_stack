import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import videoRoutes from "./routes/videoRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: "https://test-mern-stack.vercel.app", // Your React frontend URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));
app.use(express.json());

// Connect DB
connectDB();

// Serve WebGL files statically
app.use("/webgl", express.static(path.join(__dirname, "WebGL")));

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/audios", audioRoutes);
app.use("/api/pdfs", pdfRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).send("Server is online");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
