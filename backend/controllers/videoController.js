import { getBucket } from "../config/db.js";

// Upload video
const uploadVideo = (req, res) => {
  if (!req.fileId) {
    return res.status(400).json({ message: "Video upload failed" });
  }
  res.status(201).json({ message: "Video uploaded successfully", fileId: req.fileId });
};

// Get a video by filename
const getVideo = async (req, res) => {
  try {
    const bucket = getBucket("videos"); // Specify the bucket type
    const filename = req.params.filename;
    const files = await bucket.find({ filename }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = files[0];

    // Set response headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", file.contentType || "video/mp4"); // Use stored content type

    // Stream the video
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllVideos = async (req, res) => { 
  try {
    const bucket = getBucket("videos"); // Specify the bucket type

    const files = await bucket.find({ contentType: /^video\// }).toArray(); // Filter only video files

    if (!files.length) {
      return res.status(404).json({ message: "No videos found" });
    }

    const videoList = files.map((file) => ({
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
    }));

    res.status(200).json(videoList);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { uploadVideo, getVideo, getAllVideos };
