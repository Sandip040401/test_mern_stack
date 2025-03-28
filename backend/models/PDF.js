import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
});

export default mongoose.model("PDF", pdfSchema);
