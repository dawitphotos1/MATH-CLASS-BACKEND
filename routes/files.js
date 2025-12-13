
// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";

import lessonController from "../controllers/lessonController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ---------------------------------------------------------------
   PATH HELPERS
---------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(process.cwd(), "Uploads");
if (!fsSync.existsSync(UPLOADS_DIR)) {
  fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/* ---------------------------------------------------------------
   UPLOAD ENV DEBUG
---------------------------------------------------------------- */
router.get("/debug/env", (req, res) => {
  res.json({
    success: true,
    cloudinary: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
      USE_CLOUDINARY: process.env.USE_CLOUDINARY || "undefined",
    },
    node_env: process.env.NODE_ENV,
    backend_url: process.env.BACKEND_URL,
    uploads_dir: UPLOADS_DIR,
    message: "Environment variables check",
  });
});

/* ---------------------------------------------------------------
   TEST UPLOAD
   Accepts lesson upload fields (file, video, attachments, etc.)
---------------------------------------------------------------- */
router.post(
  "/test-upload",
  uploadMiddleware.uploadLessonFiles,
  async (req, res) => {
    try {
      console.log("🧪 Test upload fields:", Object.keys(req.files || {}));

      let processed = null;
      if (typeof uploadMiddleware.processUploadedFiles === "function") {
        processed = await uploadMiddleware.processUploadedFiles(req);
      }

      res.json({
        success: true,
        message: "Upload processed successfully",
        files_raw: req.files || null,
        processed,
        storage: uploadMiddleware.CLOUDINARY_CONFIGURED
          ? "cloudinary"
          : "local",
        uploads_dir: UPLOADS_DIR,
      });
    } catch (err) {
      console.error("❌ Test upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/* ---------------------------------------------------------------
   DEBUG LIST (LOCAL FILES + DB REFERENCES)
---------------------------------------------------------------- */
router.get("/debug/list", async (req, res) => {
  try {
    const files = (await fs.readdir(UPLOADS_DIR)).slice(0, 500);
    const db = await import("../models/index.js");
    const { Lesson, Course, Sequelize } = db.default;

    const lessons = await Lesson.findAll({
      where: {
        [Sequelize.Op.or]: [
          { file_url: { [Sequelize.Op.ne]: null } },
          { video_url: { [Sequelize.Op.ne]: null } },
        ],
      },
      attributes: ["id", "title", "file_url", "video_url", "content_type"],
      order: [["id", "ASC"]],
      limit: 200,
    });

    res.json({
      success: true,
      uploads_directory: UPLOADS_DIR,
      local_files: files,
      lessons_with_files: lessons,
      environment: {
        node_env: process.env.NODE_ENV,
        cloudinary_enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
      },
    });
  } catch (err) {
    console.error("❌ Debug list error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------------
   FILE METADATA TEST (LOCAL)
---------------------------------------------------------------- */
router.get("/test/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const localPath = path.join(UPLOADS_DIR, filename);

    if (!fsSync.existsSync(localPath)) {
      return res.json({
        success: true,
        exists: false,
        filename,
        path: localPath,
      });
    }

    const stats = fsSync.statSync(localPath);
    res.json({
      success: true,
      exists: true,
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    });
  } catch (err) {
    console.error("❌ File test error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON (FIXED ✅)
---------------------------------------------------------------- */
router.get(
  "/preview-lesson/:lessonId",
  lessonController.getPublicPreviewByLessonId
);

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER
   - Serves local files
   - Redirects Cloudinary URLs
---------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);

    // Redirect Cloudinary URLs
    if (filename.includes("cloudinary.com")) {
      if (filename.includes("/image/upload/") && filename.endsWith(".pdf")) {
        return res.redirect(
          301,
          filename.replace("/image/upload/", "/raw/upload/")
        );
      }
      return res.redirect(301, filename);
    }

    const basename = path.basename(filename);
    const localPath = path.join(UPLOADS_DIR, basename);

    if (!fsSync.existsSync(localPath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
        filename: basename,
      });
    }

    const ext = path.extname(basename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    fsSync.createReadStream(localPath).pipe(res);
  } catch (err) {
    console.error("❌ File server error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
