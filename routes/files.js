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
//    UPLOADS DIRECTORY
// ---------------------------------------------------------------- */
// const UPLOADS_DIR = path.join(process.cwd(), "Uploads");

// // Create directory if it doesn't exist
// if (!fsSync.existsSync(UPLOADS_DIR)) {
//   fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// /* ---------------------------------------------------------------
//    NEW: ENVIRONMENT DEBUG ENDPOINT
// ---------------------------------------------------------------- */
// router.get("/debug/env", (req, res) => {
//   res.json({
//     success: true,
//     cloudinary: {
//       CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
//       CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
//       CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
//       USE_CLOUDINARY: process.env.USE_CLOUDINARY || "false",
//       CLOUDINARY_URL: process.env.CLOUDINARY_URL ? "SET" : "NOT SET"
//     },
//     node_env: process.env.NODE_ENV,
//     backend_url: process.env.BACKEND_URL,
//     uploads_dir: UPLOADS_DIR,
//     message: "Environment variables check"
//   });
// });

// /* ---------------------------------------------------------------
//    NEW: TEST UPLOAD ENDPOINT
// ---------------------------------------------------------------- */
// import upload from "../middleware/uploadMiddleware.js";

// router.post("/test-upload", upload.single("file"), async (req, res) => {
//   try {
//     console.log("🧪 Test upload received");
    
//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "No file uploaded",
//         files: req.files ? Object.keys(req.files) : "none",
//         body: req.body
//       });
//     }
    
//     res.json({
//       success: true,
//       message: "File uploaded successfully",
//       file: {
//         originalname: req.file.originalname,
//         filename: req.file.filename,
//         path: req.file.path,
//         size: req.file.size,
//         mimetype: req.file.mimetype,
//         location: req.file.location || "local"
//       },
//       storage: req.file.location ? "cloudinary" : "local",
//       uploads_dir: UPLOADS_DIR
//     });
//   } catch (err) {
//     console.error("Test upload error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// /* ---------------------------------------------------------------
//    DEBUG ENDPOINT - List all files and database entries
// ---------------------------------------------------------------- */
// router.get("/debug/list", async (req, res) => {
//   try {
//     console.log("🔍 Debug endpoint called");

//     // List all files in Uploads directory
//     let files = [];
//     try {
//       files = await fs.readdir(UPLOADS_DIR);
//       console.log(`📁 Found ${files.length} files in ${UPLOADS_DIR}`);
//     } catch (err) {
//       console.log("No files in Uploads directory:", err.message);
//     }

//     // Get database connection
//     const db = await import("../models/index.js");
//     const { Lesson, Course } = db.default;

//     // Get all lessons with file URLs
//     let lessonsWithFiles = [];
//     try {
//       lessonsWithFiles = await Lesson.findAll({
//         where: {
//           [db.default.Sequelize.Op.or]: [
//             { file_url: { [db.default.Sequelize.Op.ne]: null } },
//             { file_url: { [db.default.Sequelize.Op.ne]: "" } },
//             { video_url: { [db.default.Sequelize.Op.ne]: null } }
//           ]
//         },
//         attributes: ['id', 'title', 'file_url', 'video_url', 'content_type'],
//         order: [['id', 'ASC']],
//         limit: 100
//       });
//       console.log(`📚 Found ${lessonsWithFiles.length} lessons with files`);
//     } catch (err) {
//       console.log("Database query error:", err.message);
//     }

//     // Get all courses with thumbnails
//     let coursesWithThumbnails = [];
//     try {
//       coursesWithThumbnails = await Course.findAll({
//         where: {
//           thumbnail: { [db.default.Sequelize.Op.ne]: null }
//         },
//         attributes: ['id', 'title', 'thumbnail'],
//         order: [['id', 'ASC']],
//         limit: 20
//       });
//       console.log(`🎓 Found ${coursesWithThumbnails.length} courses with thumbnails`);
//     } catch (err) {
//       console.log("Courses query error:", err.message);
//     }

//     // Check file existence
//     const lessonsWithFileCheck = lessonsWithFiles.map(lesson => {
//       let fileExists = false;
//       let localPath = null;
      
//       if (lesson.file_url && lesson.file_url.trim() !== "") {
//         // Extract filename
//         let filename = lesson.file_url;
//         if (filename.includes("/")) {
//           filename = path.basename(filename);
//         }
//         localPath = path.join(UPLOADS_DIR, filename);
        
//         try {
//           fileExists = fsSync.existsSync(localPath);
//         } catch (err) {
//           console.log(`File check error for ${filename}:`, err.message);
//         }
//       }
      
//       return {
//         id: lesson.id,
//         title: lesson.title,
//         file_url: lesson.file_url,
//         video_url: lesson.video_url,
//         content_type: lesson.content_type,
//         file_exists: fileExists,
//         local_path: localPath,
//         is_cloudinary: lesson.file_url?.includes('cloudinary.com') || false
//       };
//     });

//     res.json({
//       success: true,
//       uploads_directory: UPLOADS_DIR,
//       local_files: files,
//       total_local_files: files.length,
//       lessons_with_files: lessonsWithFileCheck,
//       courses_with_thumbnails: coursesWithThumbnails,
//       environment: {
//         node_env: process.env.NODE_ENV,
//         use_cloudinary: process.env.USE_CLOUDINARY,
//         cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME),
//         backend_url: process.env.BACKEND_URL,
//         uploads_dir_exists: fsSync.existsSync(UPLOADS_DIR)
//       }
//     });
//   } catch (err) {
//     console.error("Debug endpoint error:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//       stack: process.env.NODE_ENV === "development" ? err.stack : undefined
//     });
//   }
// });

// /* ---------------------------------------------------------------
//    TEST FILE ENDPOINT
// ---------------------------------------------------------------- */
// router.get("/test/:filename", async (req, res) => {
//   try {
//     const { filename } = req.params;
//     const localPath = path.join(UPLOADS_DIR, filename);
    
//     console.log(`🧪 Testing file: ${filename}`);
//     console.log(`📁 Local path: ${localPath}`);
    
//     const exists = fsSync.existsSync(localPath);
//     if (exists) {
//       const stats = fsSync.statSync(localPath);
//       res.json({
//         success: true,
//         filename,
//         exists: true,
//         path: localPath,
//         size: stats.size,
//         created: stats.birthtime,
//         modified: stats.mtime,
//         uploads_dir: UPLOADS_DIR,
//         message: "File exists and is accessible"
//       });
//     } else {
//       res.json({
//         success: true,
//         filename,
//         exists: false,
//         path: localPath,
//         uploads_dir: UPLOADS_DIR,
//         message: "File not found in Uploads directory"
//       });
//     }
//   } catch (err) {
//     console.error("Test endpoint error:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//       filename: req.params.filename
//     });
//   }
// });

// /* ---------------------------------------------------------------
//    PUBLIC PREVIEW LESSON ENDPOINT
// ---------------------------------------------------------------- */
// router.get("/preview-lesson/:lessonId", getPublicPreviewByLessonId);

// /* ---------------------------------------------------------------
//    UNIVERSAL FILE SERVER - HANDLES LOCAL AND CLOUDINARY FILES
// ---------------------------------------------------------------- */
// router.get("/:filename", async (req, res) => {
//   try {
//     let { filename } = req.params;
//     filename = decodeURIComponent(filename);
    
//     console.log(`📁 File request: ${filename}`);
    
//     // If it's already a Cloudinary URL, redirect to it
//     if (filename.includes("cloudinary.com")) {
//       console.log(`☁️ Redirecting to Cloudinary URL: ${filename.substring(0, 80)}...`);
      
//       // Fix PDF URLs in Cloudinary
//       if (filename.includes("/image/upload/") && filename.toLowerCase().endsWith('.pdf')) {
//         const correctedUrl = filename.replace("/image/upload/", "/raw/upload/");
//         console.log(`📄 Fixed Cloudinary PDF URL: ${correctedUrl.substring(0, 80)}...`);
//         return res.redirect(301, correctedUrl);
//       }
      
//       return res.redirect(301, filename);
//     }
    
//     // Extract just the filename from the path
//     const basename = path.basename(filename);
//     const localPath = path.join(UPLOADS_DIR, basename);
    
//     console.log(`🔍 Looking for file: ${basename}`);
//     console.log(`📁 Local path: ${localPath}`);
    
//     // Try local file first
//     if (fsSync.existsSync(localPath)) {
//       console.log(`✅ File found locally: ${basename}`);
      
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
      
//       console.log(`🚀 Serving file: ${basename} (${mime})`);
//       return;
//     }
    
//     // In production with Cloudinary, check database for Cloudinary URLs
//     if (process.env.NODE_ENV === "production" && process.env.USE_CLOUDINARY === "true") {
//       console.log(`☁️ Production + Cloudinary mode - checking database for: ${basename}`);
      
//       try {
//         const db = await import("../models/index.js");
//         const { Lesson, Course } = db.default;
        
//         // Search in lessons
//         const lessons = await Lesson.findAll({
//           where: {
//             [db.default.Sequelize.Op.or]: [
//               { file_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
//               { video_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
//             ],
//           },
//           attributes: ["file_url", "video_url"],
//           limit: 5
//         });
        
//         // Search in courses
//         const courses = await Course.findAll({
//           where: {
//             thumbnail: { [db.default.Sequelize.Op.like]: `%${basename}%` },
//           },
//           attributes: ["thumbnail"],
//           limit: 5
//         });
        
//         // Check all found URLs
//         const allUrls = [];
//         lessons.forEach(lesson => {
//           if (lesson.file_url?.includes(basename)) allUrls.push(lesson.file_url);
//           if (lesson.video_url?.includes(basename)) allUrls.push(lesson.video_url);
//         });
//         courses.forEach(course => {
//           if (course.thumbnail?.includes(basename)) allUrls.push(course.thumbnail);
//         });
        
//         // If we found a Cloudinary URL, redirect to it
//         for (const url of allUrls) {
//           if (url.includes('cloudinary.com')) {
//             console.log(`✅ Found Cloudinary URL: ${url.substring(0, 80)}...`);
            
//             // Fix PDF URLs in Cloudinary
//             if (url.includes("/image/upload/") && url.toLowerCase().endsWith('.pdf')) {
//               const correctedUrl = url.replace("/image/upload/", "/raw/upload/");
//               console.log(`📄 Fixed Cloudinary PDF URL: ${correctedUrl.substring(0, 80)}...`);
//               return res.redirect(301, correctedUrl);
//             }
            
//             return res.redirect(301, url);
//           }
//         }
        
//         console.log(`❌ No Cloudinary URL found for: ${basename}`);
//       } catch (dbErr) {
//         console.log(`Database search error: ${dbErr.message}`);
//       }
//     }
    
//     // File not found
//     console.log(`❌ File not found: ${basename}`);
//     return res.status(404).json({
//       success: false,
//       error: `File not found: ${basename}`,
//       message: "The requested file could not be found on the server.",
//       suggestion: process.env.NODE_ENV === "production" && process.env.USE_CLOUDINARY === "true"
//         ? "This file may have been uploaded to Cloudinary. Please check if the file URL in the database is a Cloudinary URL."
//         : "Make sure the file exists in the Uploads directory.",
//       environment: {
//         node_env: process.env.NODE_ENV,
//         use_cloudinary: process.env.USE_CLOUDINARY,
//         backend_url: process.env.BACKEND_URL,
//       },
//       requested: filename,
//       searched_path: localPath,
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
import uploadMiddleware from "../middleware/uploadMiddleware.js";


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(process.cwd(), "Uploads");
if (!fsSync.existsSync(UPLOADS_DIR)) fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });

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
      USE_CLOUDINARY: process.env.USE_CLOUDINARY || "undefined"
    },
    node_env: process.env.NODE_ENV,
    backend_url: process.env.BACKEND_URL,
    uploads_dir: UPLOADS_DIR,
    message: "Environment variables check"
  });
});

/* ---------------------------------------------------------------
   TEST UPLOAD
   Accepts same fields as lesson uploads: video, file, pdf, attachments
   Use upload.uploadLessonFiles (fields) so multiple fields work
---------------------------------------------------------------- */
router.post(
  "/test-upload",
  uploadMiddleware.uploadLessonFiles,
  async (req, res) => {
    try {
      console.log(
        "🧪 Test upload received (fields):",
        Object.keys(req.files || {})
      );

      // Process uploaded files (uploads to Cloudinary or save locally)
      let processed = req.processedUploads || null;
      try {
        if (typeof upload.processUploadedFiles === "function") {
          processed = await upload.processUploadedFiles(req);
        }
      } catch (err) {
        console.warn("processUploadedFiles failed:", err?.message || err);
      }

      res.json({
        success: true,
        message: "Upload processed",
        files_raw: req.files || null,
        processed,
        storage: upload.CLOUDINARY_CONFIGURED
          ? "cloudinary (preferred)"
          : "local (fallback)",
        uploads_dir: UPLOADS_DIR,
      });
    } catch (err) {
      console.error("Test upload error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/* ---------------------------------------------------------------
   DEBUG LIST - local files + DB entries
---------------------------------------------------------------- */
router.get("/debug/list", async (req, res) => {
  try {
    const files = (await fs.readdir(UPLOADS_DIR)).slice(0, 500);
    const db = await import("../models/index.js");
    const { Lesson, Course } = db.default;

    const lessonsWithFiles = await Lesson.findAll({
      where: {
        [db.default.Sequelize.Op.or]: [
          { file_url: { [db.default.Sequelize.Op.ne]: null } },
          { file_url: { [db.default.Sequelize.Op.ne]: "" } },
          { video_url: { [db.default.Sequelize.Op.ne]: null } }
        ]
      },
      attributes: ['id', 'title', 'file_url', 'video_url', 'content_type'],
      order: [['id', 'ASC']],
      limit: 200
    });

    const coursesWithThumbnails = await Course.findAll({
      where: { thumbnail: { [db.default.Sequelize.Op.ne]: null } },
      attributes: ['id', 'title', 'thumbnail'],
      order: [['id', 'ASC']],
      limit: 50
    });

    const lessonsWithFileCheck = lessonsWithFiles.map(lesson => {
      let fileExists = false;
      let localPath = null;
      if (lesson.file_url && lesson.file_url.trim() !== "") {
        let filename = lesson.file_url;
        if (filename.includes("/")) filename = path.basename(filename);
        localPath = path.join(UPLOADS_DIR, filename);
        try {
          fileExists = fsSync.existsSync(localPath);
        } catch (err) {
          console.log("File check error:", err.message);
        }
      }
      return {
        id: lesson.id,
        title: lesson.title,
        file_url: lesson.file_url,
        video_url: lesson.video_url,
        content_type: lesson.content_type,
        file_exists: fileExists,
        local_path: localPath,
        is_cloudinary: lesson.file_url?.includes("cloudinary.com") || false
      };
    });

    res.json({
      success: true,
      uploads_directory: UPLOADS_DIR,
      local_files: files,
      total_local_files: files.length,
      lessons_with_files: lessonsWithFileCheck,
      courses_with_thumbnails: coursesWithThumbnails,
      environment: {
        node_env: process.env.NODE_ENV,
        use_cloudinary: process.env.USE_CLOUDINARY,
        cloudinary_configured: !!process.env.CLOUDINARY_CLOUD_NAME,
        backend_url: process.env.BACKEND_URL,
        uploads_dir_exists: fsSync.existsSync(UPLOADS_DIR)
      }
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
   TEST FILE - metadata (local)
---------------------------------------------------------------- */
router.get("/test/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const localPath = path.join(UPLOADS_DIR, filename);
    const exists = fsSync.existsSync(localPath);
    if (exists) {
      const stats = fsSync.statSync(localPath);
      res.json({
        success: true,
        filename,
        exists: true,
        path: localPath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        uploads_dir: UPLOADS_DIR,
        message: "File exists and is accessible"
      });
    } else {
      res.json({
        success: true,
        filename,
        exists: false,
        path: localPath,
        uploads_dir: UPLOADS_DIR,
        message: "File not found in Uploads directory"
      });
    }
  } catch (err) {
    console.error("Test endpoint error:", err);
    res.status(500).json({ success: false, error: err.message, filename: req.params.filename });
  }
});

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON ENDPOINT
---------------------------------------------------------------- */
router.get("/preview-lesson/:lessonId", getPublicPreviewByLessonId);

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER - serves local uploads or redirects to Cloudinary
---------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);
    console.log("📁 File request:", filename);

    // If user passed a full Cloudinary URL in the path, redirect
    if (filename.includes("cloudinary.com")) {
      if (filename.includes("/image/upload/") && filename.toLowerCase().endsWith(".pdf")) {
        const correctedUrl = filename.replace("/image/upload/", "/raw/upload/");
        return res.redirect(301, correctedUrl);
      }
      return res.redirect(301, filename);
    }

    const basename = path.basename(filename);
    const localPath = path.join(UPLOADS_DIR, basename);

    // Serve local file if exists
    if (fsSync.existsSync(localPath)) {
      const ext = path.extname(basename).toLowerCase();
      const mimeTypes = {
        ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm",
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif",
        ".mov": "video/quicktime", ".avi": "video/x-msvideo",
        ".doc": "application/msword", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain"
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
      return;
    }

    // If running in production and cloudinary urls are used in DB, try to find matching cloudinary URL
    if (process.env.USE_CLOUDINARY === "true" || !!process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const db = await import("../models/index.js");
        const { Lesson, Course } = db.default;

        const lessons = await Lesson.findAll({
          where: {
            [db.default.Sequelize.Op.or]: [
              { file_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
              { video_url: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
            ],
          },
          attributes: ["file_url", "video_url"],
          limit: 10
        });

        const courses = await Course.findAll({
          where: { thumbnail: { [db.default.Sequelize.Op.like]: `%${basename}%` } },
          attributes: ["thumbnail"],
          limit: 10
        });

        const allUrls = [];
        lessons.forEach(l => { if (l.file_url?.includes(basename)) allUrls.push(l.file_url); if (l.video_url?.includes(basename)) allUrls.push(l.video_url); });
        courses.forEach(c => { if (c.thumbnail?.includes(basename)) allUrls.push(c.thumbnail); });

        for (const url of allUrls) {
          if (url.includes("cloudinary.com")) {
            if (url.includes("/image/upload/") && url.toLowerCase().endsWith(".pdf")) {
              const correctedUrl = url.replace("/image/upload/", "/raw/upload/");
              return res.redirect(301, correctedUrl);
            }
            return res.redirect(301, url);
          }
        }
      } catch (dbErr) {
        console.log("DB search error while resolving cloudinary URL:", dbErr.message);
      }
    }

    // Not found
    return res.status(404).json({
      success: false,
      error: `File not found: ${basename}`,
      suggestion: "Ensure file was uploaded (Cloudinary or local Uploads) and DB entry contains accessible URL.",
      requested: filename,
      searched_path: localPath
    });
  } catch (err) {
    console.error("❌ File server error:", err?.message || err);
    res.status(500).json({ success: false, error: "Failed to load file", details: err?.message });
  }
});

export default router;
