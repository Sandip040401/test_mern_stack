import express from "express";
import upload from "../middleware/upload.js";
import { uploadVideo, getVideo } from "../controllers/videoController.js";

const router = express.Router();

router.post("/upload", upload.single("video"), uploadVideo);
router.get("/:filename", getVideo);

export default router;
