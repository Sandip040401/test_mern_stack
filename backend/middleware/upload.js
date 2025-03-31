import multer from "multer";
import { getBucket } from "../config/db.js";
import { Readable } from "stream";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs";
import { spawn } from "child_process";

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const getFileType = (mimetype) => {
  if (mimetype.startsWith("application/pdf")) return "pdfs";
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("audio/")) return "audios";
  return "others"; 
};

// Function to find Python executable
const findPython = () => {
  return new Promise((resolve, reject) => {
    const checkPython = spawn(process.platform === "win32" ? "python" : "python3", ["--version"]);

    checkPython.on("error", () => reject("Python not found"));
    checkPython.stdout.on("data", () => resolve(process.platform === "win32" ? "python" : "python3"));
    checkPython.stderr.on("data", () => resolve(process.platform === "win32" ? "python" : "python3"));
  });
};

const convertVideoToWebP = async (buffer, filename, ws) => {
  const pythonExecutable = await findPython();
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), filename);
    const outputPath = inputPath.replace(/\.\w+$/, ".webm");

    fs.writeFileSync(inputPath, buffer);
    console.log(`Processing video: ${inputPath}`);

    const pythonProcess = spawn(pythonExecutable, ["convert_video.py", inputPath]);

    let convertedPath = "";
    let totalDuration = 0;
    let lastProgress = 0;

    // Function to calculate progress percentage
    const calculateProgress = (currentTime, totalTime) => {
      const timeToSeconds = (time) => {
        const [h, m, s] = time.split(":").map(parseFloat);
        return h * 3600 + m * 60 + s;
      };

      const currentSeconds = timeToSeconds(currentTime);
      const totalSeconds = timeToSeconds(totalTime);

      if (totalSeconds === 0) return 0; // Avoid division by zero
      return (currentSeconds / totalSeconds) * 100;
    };

    // Capture FFmpeg logs from stderr
    pythonProcess.stderr.on("data", (data) => {
      const errorOutput = data.toString().trim();

      // Match total video duration
      const durationMatch = errorOutput.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (durationMatch) {
        totalDuration = durationMatch[1];
        console.log(`Total Duration: ${totalDuration}`);
      }

      // Match processing timestamp and calculate progress
      const timeMatch = errorOutput.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (timeMatch && totalDuration) {
        const progress = calculateProgress(timeMatch[1], totalDuration);
        
        if (Math.abs(progress - lastProgress) >= 1) { // Emit only if progress changes by at least 1%
          console.log(`⚡ Conversion Progress: ${progress.toFixed(2)}%`);
          lastProgress = progress;

          if (ws) {
            ws.emit("uploadProgress", { progress: progress.toFixed(2) });
          }
        }
      }
    });

    // Capture stdout for completion and file path
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      console.log(`[FFmpeg Output] ${output}`);

      if (output.startsWith("Conversion successful")) {
        convertedPath = output.split("Output file: ")[1];
      }
    });

    pythonProcess.on("close", (code) => {
      fs.unlinkSync(inputPath);
      if (code === 0 && convertedPath) {
        console.log(`✅ Conversion completed: ${convertedPath}`);
        if (ws) {
          ws.emit("uploadProgress", { progress: 100 }); // Send final 100% progress
        }
        resolve(convertedPath);
      } else {
        console.error("❌ FFmpeg conversion failed.");
        reject("FFmpeg conversion failed.");
      }
    });
  });
};





// Upload to GridFS after conversion
const uploadToGridFS = async (req, res, next) => {
  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileType = getFileType(req.file.mimetype);
    const bucket = getBucket(fileType);
    console.log(`📤 Uploading ${req.file.originalname} to ${fileType} bucket...`);

    let readableStream;
    let filename = req.file.originalname;

    if (fileType === "videos") {
      console.log(`⏳ Converting video before upload: ${filename}`);
      const convertedPath = await convertVideoToWebP(req.file.buffer, filename, req.io); // Pass WebSocket instance
      readableStream = fs.createReadStream(convertedPath);
      filename = filename.replace(/\.\w+$/, ".webm");
    } else if (fileType === "pdfs") {
      readableStream = Readable.from(req.file.buffer);
    } else {
      console.error("❌ Invalid file type");
      return res.status(400).json({ message: "Invalid file type" });
    }

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
    });

    let uploadedBytes = 0;
    readableStream.on("data", (chunk) => {
      uploadedBytes += chunk.length;
      console.log(`📊 Uploaded: ${uploadedBytes} bytes`);
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      console.log(`✅ ${filename} upload completed.`);
      if (req.io) {
        req.io.emit("upload_complete", { filename });
      }
      req.fileId = uploadStream.id;
      req.bucketName = fileType;
      next();
    });

    uploadStream.on("error", (error) => {
      console.error("❌ GridFS Upload Error:", error);
      res.status(500).json({ message: "Upload failed" });
    });
  } catch (error) {
    console.error("❌ Processing Error:", error);
    res.status(500).json({ message: "Processing Error" });
  }
};



export { upload, uploadToGridFS };