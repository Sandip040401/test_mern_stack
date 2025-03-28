import mongoose from "mongoose";
import Audio from "../models/Audio.js";

export const uploadAudio = async (req, res) => {
  res.json({ message: "Audio uploaded successfully", file: req.file });
};

export const getAudio = async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });

  const audio = await Audio.findOne({ filename: req.params.filename });

  if (!audio) {
    return res.status(404).json({ message: "Audio not found" });
  }

  res.set("Content-Type", audio.contentType);
  bucket.openDownloadStreamByName(req.params.filename).pipe(res);
};
