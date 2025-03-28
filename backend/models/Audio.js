import mongoose from "mongoose";

const audioSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
});

export default mongoose.model("Audio", audioSchema);
