// // routes/files.js
// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import fsSync from "fs";
// import { fileURLToPath } from "url";
// import { getPublicPreviewByLessonId } from "../controllers/lessonController.js";

// const router = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ---------------------------------------------------------------
//    UPLOADS DIRECTORY - For development/local files only
// --------------------------------------------------------------- */
// const UPLOADS_DIR = path.join(process.cwd(), "Uploads");

// // Create directory if it doesn't exist
// if (!fsSync.existsSync(UPLOADS_DIR)) {
//   fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// /* ---------------------------------------------------------------
//    PUBLIC PREVIEW LESSON ENDPOINT
// --------------------------------------------------------------- */
// router.get("/preview-lesson/:lessonId", getPublicPreviewByLessonId);

// /* ---------------------------------------------------------------
//    UNIVERSAL FILE SERVER - Handles local and Cloudinary files
// --------------------------------------------------------------- */
// router.get("/:filename", async (req, res) => {
//   try {
//     let { filename } = req.params;
//     filename = decodeURIComponent(filename);

//     console.log(`📁 File request: ${filename}`);

//     // If it's already a Cloudinary URL, redirect to it
//     if (filename.includes("cloudinary.com")) {
//       return res.redirect(301, filename);
//     }

//     // Extract just the filename from the path
//     const basename = path.basename(filename);
//     const localPath = path.join(UPLOADS_DIR, basename);

//     // Try local file first (development)
//     if (fsSync.existsSync(localPath)) {
//       const ext = path.extname(basename).toLowerCase();
//       const mimeTypes = {
//         ".pdf": "application/pdf",
//         ".mp4": "video/mp4",
//         ".jpg": "image/jpeg",
//         ".jpeg": "image/jpeg",
//         ".png": "image/png",
//         ".gif": "image/gif",
//         ".doc": "application/msword",
//         ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         ".txt": "text/plain",
//         ".webm": "video/webm",
//         ".mov": "video/quicktime",
//         ".avi": "video/x-msvideo",
//       };

//       const mime = mimeTypes[ext] || "application/octet-stream";
//       res.setHeader("Content-Type", mime);

//       const inlineExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "mp4", "webm", "mov", "avi"];
//       const extWithoutDot = ext.replace(".", "");

//       res.setHeader(
//         "Content-Disposition",
//         inlineExtensions.includes(extWithoutDot)
//           ? `inline; filename="${basename}"`
//           : `attachment; filename="${basename}"`
//       );

//       res.setHeader("Access-Control-Allow-Origin", "*");
//       res.setHeader("Cache-Control", "public, max-age=86400");

//       const fileStream = fsSync.createReadStream(localPath);
//       fileStream.pipe(res);

//       console.log(`✅ Local file served: ${basename}`);
//       return;
//     }

//     // In production, files should be on Cloudinary
//     if (process.env.NODE_ENV === "production") {
//       console.log(`☁️ Looking for file in Cloudinary: ${basename}`);
      
//       // Check if the file exists in the database with a Cloudinary URL
//       const db = await import("../models/index.js");
//       const { Lesson, Course } = db.default;

//       // Search in lessons
//       const lessons = await Lesson.findAll({
//         where: {
//           [db.default.Sequelize.Op.or]: [
//             { file_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
//             { video_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
//           ],
//         },
//         attributes: ["file_url", "video_url"],
//       });

//       // Search in courses
//       const courses = await Course.findAll({
//         where: {
//           thumbnail: { [db.default.Sequelize.Op.like]: `%${basename}%` },
//         },
//         attributes: ["thumbnail"],
//       });

//       // Check all found URLs
//       const allUrls = [];
//       lessons.forEach(lesson => {
//         if (lesson.file_url?.includes(basename)) allUrls.push(lesson.file_url);
//         if (lesson.video_url?.includes(basename)) allUrls.push(lesson.video_url);
//       });
//       courses.forEach(course => {
//         if (course.thumbnail?.includes(basename)) allUrls.push(course.thumbnail);
//       });

//       // If we found a Cloudinary URL, redirect to it
//       for (const url of allUrls) {
//         if (url.includes('cloudinary.com')) {
//           console.log(`✅ Found Cloudinary URL: ${url.substring(0, 80)}...`);
//           return res.redirect(301, url);
//         }
//       }

//       // No Cloudinary URL found, return 404
//       console.log(`❌ File not found in Cloudinary: ${basename}`);
//     }

//     // File not found
//     console.log(`❌ File not found: ${basename}`);
//     return res.status(404).json({
//       success: false,
//       error: `File not found: ${basename}`,
//       message: "The requested file could not be found on the server.",
//       suggestion: process.env.NODE_ENV === "production" 
//         ? "This file may have been uploaded to Cloudinary. Please check if the file URL in the database is a Cloudinary URL."
//         : "Make sure the file exists in the Uploads directory.",
//       environment: process.env.NODE_ENV,
//     });

//   } catch (err) {
//     console.error("❌ File server error:", err.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load file",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// });

// export default router;






// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";
import { getPublicPreviewByLessonId } from "../controllers/lessonController.js";

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
   DEBUG ENDPOINT - List all files and database entries
--------------------------------------------------------------- */
router.get("/debug/list", async (req, res) => {
  try {
    // List all files in Uploads directory
    const files = await fs.readdir(UPLOADS_DIR);
    
    // Get database connection
    const db = await import("../models/index.js");
    const { Lesson, Course } = db.default;
    
    // Get all lessons with file URLs
    const lessonsWithFiles = await Lesson.findAll({
      where: {
        [db.default.Sequelize.Op.or]: [
          { file_url: { [db.default.Sequelize.Op.ne]: null } },
          { video_url: { [db.default.Sequelize.Op.ne]: null } }
        ]
      },
      attributes: ['id', 'title', 'file_url', 'video_url', 'content_type'],
      order: [['id', 'ASC']]
    });
    
    // Get all courses with thumbnails
    const coursesWithThumbnails = await Course.findAll({
      where: {
        thumbnail: { [db.default.Sequelize.Op.ne]: null }
      },
      attributes: ['id', 'title', 'thumbnail'],
      order: [['id', 'ASC']]
    });
    
    res.json({
      success: true,
      uploads_directory: UPLOADS_DIR,
      local_files: files,
      total_local_files: files.length,
      lessons_with_files: lessonsWithFiles.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        file_url: lesson.file_url,
        video_url: lesson.video_url,
        content_type: lesson.content_type,
        file_exists: lesson.file_url ? fsSync.existsSync(path.join(UPLOADS_DIR, path.basename(lesson.file_url))) : false
      })),
      courses_with_thumbnails: coursesWithThumbnails,
      environment: process.env.NODE_ENV
    });
  } catch (err) {
    console.error("Debug endpoint error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON ENDPOINT
--------------------------------------------------------------- */
router.get("/preview-lesson/:lessonId", getPublicPreviewByLessonId);

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER - Handles local and Cloudinary files
--------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);

    console.log(`📁 File request: ${filename}`);

    // If it's already a Cloudinary URL, redirect to it
    if (filename.includes("cloudinary.com")) {
      return res.redirect(301, filename);
    }

    // Extract just the filename from the path
    const basename = path.basename(filename);
    const localPath = path.join(UPLOADS_DIR, basename);

    // Try local file first (development)
    if (fsSync.existsSync(localPath)) {
      const ext = path.extname(basename).toLowerCase();
      const mimeTypes = {
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".avi": "video/x-msvideo",
      };

      const mime = mimeTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);

      const inlineExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "mp4", "webm", "mov", "avi"];
      const extWithoutDot = ext.replace(".", "");

      res.setHeader(
        "Content-Disposition",
        inlineExtensions.includes(extWithoutDot)
          ? `inline; filename="${basename}"`
          : `attachment; filename="${basename}"`
      );

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const fileStream = fsSync.createReadStream(localPath);
      fileStream.pipe(res);

      console.log(`✅ Local file served: ${basename}`);
      return;
    }

    // In production, files should be on Cloudinary
    if (process.env.NODE_ENV === "production") {
      console.log(`☁️ Looking for file in Cloudinary: ${basename}`);
      
      // Check if the file exists in the database with a Cloudinary URL
      const db = await import("../models/index.js");
      const { Lesson, Course } = db.default;

      // Search in lessons
      const lessons = await Lesson.findAll({
        where: {
          [db.default.Sequelize.Op.or]: [
            { file_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
            { video_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
          ],
        },
        attributes: ["file_url", "video_url"],
      });

      // Search in courses
      const courses = await Course.findAll({
        where: {
          thumbnail: { [db.default.Sequelize.Op.like]: `%${basename}%` },
        },
        attributes: ["thumbnail"],
      });

      // Check all found URLs
      const allUrls = [];
      lessons.forEach(lesson => {
        if (lesson.file_url?.includes(basename)) allUrls.push(lesson.file_url);
        if (lesson.video_url?.includes(basename)) allUrls.push(lesson.video_url);
      });
      courses.forEach(course => {
        if (course.thumbnail?.includes(basename)) allUrls.push(course.thumbnail);
      });

      // If we found a Cloudinary URL, redirect to it
      for (const url of allUrls) {
        if (url.includes('cloudinary.com')) {
          console.log(`✅ Found Cloudinary URL: ${url.substring(0, 80)}...`);
          return res.redirect(301, url);
        }
      }

      // No Cloudinary URL found, return 404
      console.log(`❌ File not found in Cloudinary: ${basename}`);
    }

    // File not found
    console.log(`❌ File not found: ${basename}`);
    return res.status(404).json({
      success: false,
      error: `File not found: ${basename}`,
      message: "The requested file could not be found on the server.",
      suggestion: process.env.NODE_ENV === "production" 
        ? "This file may have been uploaded to Cloudinary. Please check if the file URL in the database is a Cloudinary URL."
        : "Make sure the file exists in the Uploads directory.",
      environment: process.env.NODE_ENV,
    });

  } catch (err) {
    console.error("❌ File server error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to load file",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;