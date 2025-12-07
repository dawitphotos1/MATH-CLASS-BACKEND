// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";

// ✅ Add this import at the top
import { getPublicPreviewByLessonId } from "../controllers/lessonController.js";

import {cloudinary} from "../utils/cloudinary.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------------------------------------
   UPLOADS DIRECTORY - For development/local files only
--------------------------------------------------------------- */
const UPLOADS_DIR = path.join(process.cwd(), "Uploads");

// Create directory if it doesn't exist
if (!fsSync.existsSync(UPLOADS_DIR)) {
  fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/* ---------------------------------------------------------------
   Cloudinary URL check helper
--------------------------------------------------------------- */
const isCloudinaryUrl = (url) => {
  return url && url.includes("cloudinary.com");
};

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON ENDPOINT (REPLACED)
--------------------------------------------------------------- */

// ❗ REPLACED with your controller function:
router.get("/preview-lesson/:lessonId", getPublicPreviewByLessonId);

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER
--------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;

    filename = path.basename(decodeURIComponent(filename));

    console.log(`📁 File request: ${filename}`);

    if (filename.includes("cloudinary.com")) {
      return res.redirect(301, filename);
    }

    const localPath = path.join(UPLOADS_DIR, filename);

    if (fsSync.existsSync(localPath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
      };

      const mime = mimeTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);

      const inlineExtensions = [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "mp4",
        "webm",
        "mov",
        "avi",
      ];
      const extWithoutDot = ext.replace(".", "");

      res.setHeader(
        "Content-Disposition",
        inlineExtensions.includes(extWithoutDot)
          ? `inline; filename="${filename}"`
          : `attachment; filename="${filename}"`
      );

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const fileStream = fsSync.createReadStream(localPath);
      fileStream.pipe(res);

      console.log(`✅ Local file served: ${filename}`);
    } else {
      console.log(`❌ File not found: ${filename}`);

      const knownFiles = [
        "Examples-1764983251988.pdf",
        "Class_work_on_increasing_and_decreasing_intervals__1_-1765036096606.pdf",
        "sample-lesson.pdf",
        "default-course.jpg",
      ];

      if (knownFiles.includes(filename)) {
        const db = await import("../models/index.js");
        const { Lesson } = db.default;

        const lessons = await Lesson.findAll({
          where: {
            [db.default.Sequelize.Op.or]: [
              { video_url: { [db.default.Sequelize.Op.like]: `%${filename}%` } },
              { file_url: { [db.default.Sequelize.Op.like]: `%${filename}%` } },
            ],
          },
        });

        if (lessons.length > 0) {
          for (const lesson of lessons) {
            if (lesson.video_url?.includes("cloudinary") && lesson.video_url.includes(filename)) {
              return res.redirect(301, lesson.video_url);
            }
            if (lesson.file_url?.includes("cloudinary") && lesson.file_url.includes(filename)) {
              return res.redirect(301, lesson.file_url);
            }
          }
        }
      }

      return res.status(404).json({
        success: false,
        error: `File not found: ${filename}`,
        searchedDirectory: UPLOADS_DIR,
        message: "The requested file could not be found on the server.",
        suggestion: "This file may have been migrated to Cloudinary storage.",
      });
    }
  } catch (err) {
    console.error("❌ File server error:", err.message);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to load file",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
});

export default router;
