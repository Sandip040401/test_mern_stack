import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import videoRoutes from "./routes/videoRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import { connectDB } from "./config/db.js";
import alphabetRoutes from "./routes/alphabetRoutes.js";


dotenv.config();
const app = express();
const server = createServer(app);  // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: "https://test-mern-stack.vercel.app",
        methods: ["GET", "POST"]
    }
});

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
app.use("/api/webgl", express.static(path.join(__dirname, "WebGL")));

// WebSocket Connection Handling
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Pass socket instance to routes/middleware
app.use((req, res, next) => {
    req.io = io;  // Attach WebSocket instance to request
    next();
});

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/audios", audioRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api", alphabetRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).send("Server is online");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
