import { getBucket } from "../config/db.js";
import PDF from "../models/PDF.js";

// Upload PDF
export const uploadPDF = async (req, res) => {
  try {
    // Assuming you are saving the file ID in req.fileId during upload
    if (!req.fileId) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ message: "PDF uploaded successfully", fileId: req.fileId });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get PDF by filename
export const getPDF = async (req, res) => {
  try {
    const bucket = getBucket("pdfs"); // Specify the bucket type
    const filename = req.params.filename;

    // Create a download stream
    const downloadStream = bucket.openDownloadStreamByName(filename);

    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error("Error downloading PDF:", error);
      return res.status(404).json({ message: "PDF not found" }); // Respond with 404 if not found
    });

    // Set response headers (if you have contentType information, use it)
    res.set("Content-Disposition", `inline; filename="${filename}"`); // Suggest browser to open in-line

    // Pipe the download stream to the response
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get all PDFs
export const getAllPDFs = async (req, res) => {
  try {
    const bucket = getBucket("pdfs"); // Specify the bucket type

    // Fetch PDF files from the bucket
    const files = await bucket.find({ contentType: /^application\/pdf/ }).toArray(); // Filter only PDF files

    if (!files.length) {
      return res.status(404).json({ message: "No PDFs found" });
    }

    const pdfList = files.map((file) => ({
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      contentType: file.contentType,
    }));

    res.status(200).json(pdfList);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update PDF filename
export const updatePDFName = async (req, res) => {
  try {
    const bucket = getBucket("pdfs"); // Get the GridFS bucket
    const { oldFilename, newFilename } = req.body;

    // Validate input
    if (!oldFilename || !newFilename) {
      return res.status(400).json({ message: "Old and new filenames are required" });
    }

    // Fetch all PDF files from the bucket
    const files = await bucket.find({ contentType: /^application\/pdf/ }).toArray();

    // Check if the old file exists in the fetched files
    const file = files.find(f => f.filename === oldFilename);

    if (!file) {
      return res.status(404).json({ message: "PDF not found" });
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
      res.status(200).json({ message: "PDF filename updated successfully", newFilename });
    });

    // Handle errors during the stream process
    readStream.on('error', (error) => {
      console.error("Error reading PDF:", error);
      return res.status(500).json({ message: "Error reading PDF" });
    });

    writeStream.on('error', (error) => {
      console.error("Error writing PDF:", error);
      return res.status(500).json({ message: "Error writing PDF" });
    });
  } catch (error) {
    console.error("Error updating PDF filename:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
