import mongoose from "mongoose";
import Video from "../models/Video.js";

export const uploadVideo = async (req, res) => {
  res.json({ message: "Video uploaded successfully", file: req.file });
};

export const getVideo = async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });

  const video = await Video.findOne({ filename: req.params.filename });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  res.set("Content-Type", video.contentType);
  bucket.openDownloadStreamByName(req.params.filename).pipe(res);
};
