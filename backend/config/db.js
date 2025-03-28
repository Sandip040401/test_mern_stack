import mongoose from "mongoose";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    return bucket;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
