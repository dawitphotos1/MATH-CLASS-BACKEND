//src/routes/fileRoutes.js
import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

/**
 * @route GET /api/v1/files/Uploads/:filename
 * @description Serves static files (videos, PDFs, documents) from the Uploads directory.
 * @access Public (or add authentication/authorization middleware here if needed)
 */
router.get("/Uploads/:filename", (req, res) => {
  const { filename } = req.params; // IMPORTANT: We use path.join(process.cwd(), 'Uploads', filename) // to create a secure, absolute path to prevent directory traversal attacks.
  const filePath = path.join(process.cwd(), "Uploads", filename);

  console.log(`Serving file request for: ${filename}`);
  console.log(`Absolute path: ${filePath}`); // 1. Check if the file exists

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return res.status(404).json({
      success: false,
      error: "The requested file could not be found on the server.",
    });
  } // 2. Serve the file // res.sendFile automatically handles MIME types based on the file extension
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Error sending file:", err.message); // Log specific error (e.g., permission denied, streaming failure)
      return res.status(500).json({
        success: false,
        error: "Server error while serving the file.",
      });
    }
    console.log(`✅ File successfully served: ${filename}`);
  });
});

export default router;