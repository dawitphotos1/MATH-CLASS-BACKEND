// routes/upload.js
const express = require("express");
const router = express.Router();
const { singleUpload, uploadToCloudinary } = require("../middleware/cloudinaryUpload.js");

// Upload endpoint for testing
router.post("/", singleUpload, async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ File upload failed: No file in request");
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    console.log(`📁 File uploaded to memory: ${req.file.originalname}`);
    console.log(`📊 File size: ${req.file.size} bytes`);
    console.log(`📋 MIME type: ${req.file.mimetype}`);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'mathe-class/uploads',
      req.file.mimetype.startsWith('image') ? 'image' : 'raw'
    );

    console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      originalFilename: req.file.originalname
    });

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to upload file to Cloudinary",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;