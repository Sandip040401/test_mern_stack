import multer from "multer";
import { getBucket } from "../config/db.js";
import { Readable } from "stream";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to determine the correct bucket based on file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith("application/pdf")) return "pdfs";
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("audio/")) return "audios";
  return "others"; // Default bucket for unknown file types
};

// Middleware to upload file to the correct GridFS bucket
const uploadToGridFS = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileType = getFileType(req.file.mimetype);
    const bucket = getBucket(fileType); // Select the appropriate bucket

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      req.fileId = uploadStream.id;
      req.bucketName = fileType; // Store the bucket name for retrieval
      next();
    });

    uploadStream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ message: "Upload failed" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "GridFS Error" });
  }
};

export { upload, uploadToGridFS };
