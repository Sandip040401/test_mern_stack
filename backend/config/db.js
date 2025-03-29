import mongoose from "mongoose";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";

dotenv.config();

let buckets = {};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // Create different buckets for each file type
    buckets.pdfs = new GridFSBucket(conn.connection.db, { bucketName: "pdfs" });
    buckets.videos = new GridFSBucket(conn.connection.db, { bucketName: "videos" });
    buckets.audios = new GridFSBucket(conn.connection.db, { bucketName: "audios" });
    buckets.others = new GridFSBucket(conn.connection.db, { bucketName: "others" });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to get the correct bucket
const getBucket = (type) => {
  if (!buckets[type]) {
    throw new Error(`GridFSBucket for ${type} is not initialized yet`);
  }
  return buckets[type];
};

export { connectDB, getBucket };
