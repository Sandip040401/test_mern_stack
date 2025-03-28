import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
});

export default mongoose.model("Video", videoSchema);
