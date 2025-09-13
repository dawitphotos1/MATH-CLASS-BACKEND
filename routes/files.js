const express = require("express");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "Uploads");

// ✅ Ensure Uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * ✅ Preview File (PDF/Image) Inline in Browser
 * GET /api/v1/files/preview/:filename
 */
router.get("/preview/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Detect MIME type based on extension
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
  };

  const mimeType = mimeTypes[ext] || "application/octet-stream";
  res.setHeader("Content-Type", mimeType);
  res.sendFile(filePath);
});

/**
 * ✅ Download File Securely (Requires Auth)
 * GET /api/v1/files/download/:filename
 */
router.get("/download/:filename", authMiddleware, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      return res
        .status(500)
        .json({ error: "Download failed", details: err.message });
    }
  });
});

/**
 * ✅ List All Uploaded Files (Debug)
 * GET /api/v1/files/list
 */
router.get("/list", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ success: true, files });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Unable to list files", details: err.message });
  }
});

module.exports = router;
