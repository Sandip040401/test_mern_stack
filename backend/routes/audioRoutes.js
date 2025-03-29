import express from "express";
import { upload, uploadToGridFS } from "../middleware/upload.js";
import {
  uploadAudio,
  getAudio,
  getAllAudios,
  updateAudioName,
} from "../controllers/audioController.js";

const router = express.Router();

// Upload audio
router.post("/upload", upload.single("audio"), uploadToGridFS, uploadAudio);

// Get audio by filename
router.get("/:filename", getAudio);

// Get all audio files
router.get("/", getAllAudios); // Adjusted to return all audio files at the root route

// Update audio filename
router.put("/update", updateAudioName); // Adjusted to update audio filename

export default router;
