import express from "express";
import upload from "../middleware/upload.js";
import { uploadAudio, getAudio } from "../controllers/audioController.js";

const router = express.Router();

router.post("/upload", upload.single("audio"), uploadAudio);
router.get("/:filename", getAudio);

export default router;
