import multer from "multer";
import { getBucket } from "../config/db.js";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs";

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to determine the correct bucket based on file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith("application/pdf")) return "pdfs";
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("audio/")) return "audios";
  return "others"; // Default bucket for unknown file types
};

// Convert video to .webm using ffmpeg
const convertVideoToWebM = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), filename);
    const outputPath = join(tmpdir(), filename.replace(/\.\w+$/, ".webm"));

    fs.writeFileSync(inputPath, buffer);
    console.log(`Converting video: ${inputPath} -> ${outputPath}`);

    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libvpx-vp9")
      .audioCodec("libopus")
      .outputOptions(["-crf 23", "-b:v 1M"])
      .on("start", () => console.log("FFmpeg processing started..."))
      .on("progress", (progress) => console.log(`Progress: ${progress.timemark}`))
      .on("end", () => {
        console.log("FFmpeg conversion finished.");
        fs.unlinkSync(inputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg Error:", err);
        fs.unlinkSync(inputPath);
        reject(err);
      })
      .run();
  });
};

// Convert audio to .webm using ffmpeg
const convertAudioToWebM = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), filename);
    const outputPath = join(tmpdir(), filename.replace(/\.\w+$/, ".webm"));

    fs.writeFileSync(inputPath, buffer);
    console.log(`Converting audio: ${inputPath} -> ${outputPath}`);

    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec("libopus")
      .outputOptions(["-b:a 128k"]) // Bitrate for quality
      .on("start", () => console.log("FFmpeg audio processing started..."))
      .on("end", () => {
        console.log("FFmpeg audio conversion finished.");
        fs.unlinkSync(inputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg Audio Error:", err);
        fs.unlinkSync(inputPath);
        reject(err);
      })
      .run();
  });
};

// Middleware to upload file to GridFS after conversion
const uploadToGridFS = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileType = getFileType(req.file.mimetype);
    const bucket = getBucket(fileType);
    console.log(`Uploading ${req.file.originalname} to ${fileType} bucket...`);

    let readableStream;
    let filename = req.file.originalname;

    if (fileType === "videos") {
      const convertedPath = await convertVideoToWebM(req.file.buffer, filename);
      readableStream = fs.createReadStream(convertedPath);
      filename = filename.replace(/\.\w+$/, ".webm");
    } else if (fileType === "audios") {
      const convertedPath = await convertAudioToWebM(req.file.buffer, filename);
      readableStream = fs.createReadStream(convertedPath);
      filename = filename.replace(/\.\w+$/, ".webm");
    } else if (fileType === "pdfs") {
      readableStream = Readable.from(req.file.buffer); // Stream directly from memory
    } else {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      console.log(`${filename} upload completed.`);
      req.fileId = uploadStream.id;
      req.bucketName = fileType;
      next();
    });

    uploadStream.on("error", (error) => {
      console.error("GridFS Upload Error:", error);
      res.status(500).json({ message: "Upload failed" });
    });
  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({ message: "Processing Error" });
  }
};


export { upload, uploadToGridFS };
