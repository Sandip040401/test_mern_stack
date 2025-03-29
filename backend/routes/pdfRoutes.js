import express from "express";
import { upload, uploadToGridFS } from "../middleware/upload.js";
import { uploadPDF, getPDF, getAllPDFs, updatePDFName } from "../controllers/pdfController.js";

const router = express.Router();

// Upload PDF
router.post("/upload", upload.single("pdf"), uploadToGridFS, uploadPDF);

// Get PDF by filename
router.get("/:filename", getPDF);

// Get all PDFs
router.get("/", getAllPDFs);

// Route to update PDF filename
router.put('/rename', updatePDFName);

export default router;
