const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

// Upload endpoint for testing
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.error("❌ File upload failed: No file in request");
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const fileUrl = `/Uploads/${req.file.originalname}-${Date.now()}.pdf`;
  console.log(`✅ File uploaded to memory: ${req.file.originalname}`);
  res.json({ success: true, url: fileUrl });
});

module.exports = router;
