import express from "express";
import { upload, uploadToGridFS } from "../middleware/upload.js";
import { uploadVideo, getVideo, getAllVideos } from "../controllers/videoController.js";

const router = express.Router();

// Upload video
router.post("/upload", upload.single("video"), uploadToGridFS, uploadVideo);

// Get a specific video by filename
router.get("/:filename", getVideo);

// Get all videos
router.get("/", getAllVideos);

export default router;
