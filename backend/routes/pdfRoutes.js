import express from "express";
import upload from "../middleware/upload.js";
import { uploadPDF, getPDF } from "../controllers/pdfController.js";

const router = express.Router();

router.post("/upload", upload.single("pdf"), uploadPDF);
router.get("/:filename", getPDF);

export default router;
