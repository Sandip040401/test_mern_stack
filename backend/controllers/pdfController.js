import mongoose from "mongoose";
import PDF from "../models/PDF.js";

export const uploadPDF = async (req, res) => {
  res.json({ message: "PDF uploaded successfully", file: req.file });
};

export const getPDF = async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });

  const pdf = await PDF.findOne({ filename: req.params.filename });

  if (!pdf) {
    return res.status(404).json({ message: "PDF not found" });
  }

  res.set("Content-Type", pdf.contentType);
  bucket.openDownloadStreamByName(req.params.filename).pipe(res);
};
