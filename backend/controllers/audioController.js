import { getBucket } from "../config/db.js";

// Upload Audio
export const uploadAudio = async (req, res) => {
  try {
    // Assuming you are saving the file ID in req.fileId during upload
    if (!req.fileId) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ message: "Audio uploaded successfully", fileId: req.fileId });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Audio by filename
export const getAudio = async (req, res) => {
  try {
    const bucket = getBucket("audios"); // Specify the bucket type for audio
    const filename = req.params.filename;

    // Create a download stream
    const downloadStream = bucket.openDownloadStreamByName(filename);

    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error("Error downloading audio:", error);
      return res.status(404).json({ message: "Audio not found" }); // Respond with 404 if not found
    });

    // Set response headers (if you have contentType information, use it)
    res.set("Content-Disposition", `inline; filename="${filename}"`); // Suggest browser to open in-line

    // Pipe the download stream to the response
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching audio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all Audio files
export const getAllAudios = async (req, res) => {
  try {
    const bucket = getBucket("audios"); // Specify the bucket type for audio

    // Fetch audio files from the bucket
    const files = await bucket.find({ contentType: /^audio\// }).toArray(); // Filter only audio files

    if (!files.length) {
      return res.status(404).json({ message: "No audio files found" });
    }

    const audioList = files.map((file) => ({
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
    }));

    res.status(200).json(audioList);
  } catch (error) {
    console.error("Error fetching audio files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Audio filename
export const updateAudioName = async (req, res) => {
  try {
    const bucket = getBucket("audios"); // Get the GridFS bucket for audio
    const { oldFilename, newFilename } = req.body;

    // Validate input
    if (!oldFilename || !newFilename) {
      return res.status(400).json({ message: "Old and new filenames are required" });
    }

    // Fetch all audio files from the bucket
    const files = await bucket.find({ contentType: /^audio\// }).toArray();

    // Check if the old file exists in the fetched files
    const file = files.find(f => f.filename === oldFilename);

    if (!file) {
      return res.status(404).json({ message: "Audio not found" });
    }

    // Create a read stream for the old file
    const readStream = bucket.openDownloadStream(file._id);
    const writeStream = bucket.openUploadStream(newFilename, {
      contentType: file.contentType, // Preserve the content type
    });

    // Pipe the read stream into the write stream to create the new file
    readStream.pipe(writeStream);

    // Handle completion of the write stream
    writeStream.on('finish', async () => {
      // Delete the old file after copying
      await bucket.delete(file._id);
      res.status(200).json({ message: "Audio filename updated successfully", newFilename });
    });

    // Handle errors during the stream process
    readStream.on('error', (error) => {
      console.error("Error reading audio:", error);
      return res.status(500).json({ message: "Error reading audio" });
    });

    writeStream.on('error', (error) => {
      console.error("Error writing audio:", error);
      return res.status(500).json({ message: "Error writing audio" });
    });
  } catch (error) {
    console.error("Error updating audio filename:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
