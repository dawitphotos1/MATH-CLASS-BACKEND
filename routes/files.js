// // // routes/files.js

// // import express from "express";
// // import path from "path";
// // import fs from "fs/promises";
// // import fsSync from "fs";
// // import { fileURLToPath } from "url";

// // const router = express.Router();

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // /* ---------------------------------------------------------------
// //    UPLOADS DIRECTORY - Multiple possible locations
// // --------------------------------------------------------------- */
// // const possibleUploadDirs = [
// //   path.join(process.cwd(), "Uploads"),
// //   path.join(__dirname, "..", "Uploads"),
// //   path.join("/opt/render/project/src", "Uploads"),
// //   path.join("/tmp", "Uploads"),
// // ];

// // // Ensure at least one uploads directory exists
// // let uploadsDir = possibleUploadDirs[0];
// // for (const dir of possibleUploadDirs) {
// //   if (fsSync.existsSync(dir)) {
// //     uploadsDir = dir;
// //     console.log(`📁 Using existing Uploads directory: ${uploadsDir}`);
// //     break;
// //   }
// // }

// // // Create the uploads directory if it doesn't exist
// // if (!fsSync.existsSync(uploadsDir)) {
// //   fsSync.mkdirSync(uploadsDir, { recursive: true });
// //   console.log(`📁 Created Uploads directory: ${uploadsDir}`);
// // }

// // /* ---------------------------------------------------------------
// //    PUBLIC PREVIEW LESSON ENDPOINT - No authentication required
// //    URL → /api/v1/files/preview-lesson/:lessonId
// // --------------------------------------------------------------- */
// // router.get("/preview-lesson/:lessonId", async (req, res) => {
// //   try {
// //     const { lessonId } = req.params;

// //     console.log("🔓 PUBLIC ACCESS - Preview lesson requested:", lessonId);

// //     const db = await import("../models/index.js");
// //     const { Lesson, Course } = db.default;

// //     const lesson = await Lesson.findByPk(lessonId, {
// //       include: [{ model: Course, as: "course" }],
// //     });

// //     if (!lesson) {
// //       console.log("❌ Preview lesson not found:", lessonId);
// //       return res.status(404).json({
// //         success: false,
// //         error: "Preview lesson not found",
// //       });
// //     }

// //     // Build absolute URLs
// //     const backend = (
// //       process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
// //     ).replace(/\/+$/, "");

// //     const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

// //     const data = lesson.toJSON();

// //     // Build full URLs for media
// //     if (data.video_url && !data.video_url.startsWith("http")) {
// //       data.video_url = `${backend}/api/v1/files/${clean(data.video_url)}`;
// //     }

// //     if (data.file_url && !data.file_url.startsWith("http")) {
// //       data.file_url = `${backend}/api/v1/files/${clean(data.file_url)}`;
// //     }

// //     console.log("✅ Public preview served successfully:", {
// //       lessonId: data.id,
// //       title: data.title,
// //       is_preview: data.is_preview,
// //       course: data.course?.title,
// //     });

// //     return res.json({
// //       success: true,
// //       lesson: data,
// //       access: "public",
// //       message: "Public preview access granted",
// //     });
// //   } catch (err) {
// //     console.error("❌ Public preview error:", err);
// //     return res.status(500).json({
// //       success: false,
// //       error: "Failed to load preview",
// //     });
// //   }
// // });

// // /* ---------------------------------------------------------------
// //    ENHANCED UNIVERSAL FILE SERVER — Public file access
// //    Handles EVERYTHING (PDF, MP4, images, docs) with multiple location support
// // --------------------------------------------------------------- */
// // router.get("/:filename", async (req, res) => {
// //   try {
// //     let { filename } = req.params;

// //     // Security: strip paths and decode URL encoding
// //     filename = path.basename(decodeURIComponent(filename));

// //     console.log(`📁 File request: ${filename}`);

// //     // Try multiple possible locations for the file
// //     let filePath = null;
// //     let foundIn = "";

// //     // List of possible file locations
// //     const searchPaths = [
// //       // Direct filename (already includes Uploads/)
// //       path.join(uploadsDir, filename),
// //       // Remove Uploads/ prefix if present
// //       path.join(uploadsDir, filename.replace(/^Uploads\//, "")),
// //       // Try with just the filename
// //       path.join(uploadsDir, path.basename(filename)),
// //     ];

// //     // Also check all possible upload directories
// //     for (const dir of possibleUploadDirs) {
// //       const possiblePath = path.join(dir, path.basename(filename));
// //       if (fsSync.existsSync(possiblePath)) {
// //         filePath = possiblePath;
// //         foundIn = dir;
// //         break;
// //       }
// //     }

// //     // If not found, check the searchPaths
// //     if (!filePath) {
// //       for (const possiblePath of searchPaths) {
// //         console.log(`🔍 Checking path: ${possiblePath}`);
// //         try {
// //           await fs.access(possiblePath);
// //           filePath = possiblePath;
// //           foundIn = path.dirname(possiblePath);
// //           console.log(`✅ Found file at: ${filePath}`);
// //           break;
// //         } catch (err) {
// //           // Continue searching
// //         }
// //       }
// //     }

// //     if (!filePath) {
// //       console.log(`❌ File not found: ${filename}`);
// //       console.log(
// //         `🔍 Searched in directories: ${possibleUploadDirs.join(", ")}`
// //       );

// //       // Create a placeholder file if this is a known missing file
// //       const knownFiles = [
// //         "Examples-1764983251988.pdf",
// //         "sample-lesson.pdf",
// //         "default-course.jpg",
// //       ];
// //       const basename = path.basename(filename);

// //       if (knownFiles.includes(basename)) {
// //         console.log(`🛠 Creating placeholder file: ${basename}`);
// //         const placeholderPath = path.join(uploadsDir, basename);

// //         let content = "";
// //         if (basename.endsWith(".pdf")) {
// //           content = `%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Resources<<>>/Contents 4 0 R/Parent 2 0 R>>\nendobj\n4 0 obj\n<</Length 44>>\nstream\nBT\n/F1 12 Tf\n56 720 Td\n(Preview File: ${basename}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000106 00000 n\n0000000175 00000 n\ntrailer\n<</Size 5/Root 1 0 R>>\nstartxref\n255\n%%EOF`;
// //         } else if (basename.endsWith(".jpg") || basename.endsWith(".png")) {
// //           content = "PLACEHOLDER IMAGE";
// //         } else {
// //           content = `This is a placeholder file for: ${basename}\nPlease upload the actual file.`;
// //         }

// //         await fs.writeFile(placeholderPath, content);
// //         filePath = placeholderPath;
// //         foundIn = uploadsDir;
// //         console.log(`✅ Created placeholder: ${placeholderPath}`);
// //       } else {
// //         return res.status(404).json({
// //           success: false,
// //           error: `File not found: ${filename}`,
// //           searchedDirectories: possibleUploadDirs,
// //           message: "The requested file could not be found on the server.",
// //         });
// //       }
// //     }

// //     // Guess MIME type
// //     const ext = path.extname(filename).toLowerCase();
// //     const mimeTypes = {
// //       ".pdf": "application/pdf",
// //       ".mp4": "video/mp4",
// //       ".jpg": "image/jpeg",
// //       ".jpeg": "image/jpeg",
// //       ".png": "image/png",
// //       ".gif": "image/gif",
// //       ".doc": "application/msword",
// //       ".docx":
// //         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// //       ".txt": "text/plain",
// //       ".webm": "video/webm",
// //       ".mov": "video/quicktime",
// //       ".avi": "video/x-msvideo",
// //     };

// //     const mime = mimeTypes[ext] || "application/octet-stream";
// //     res.setHeader("Content-Type", mime);

// //     // Inline display for PDF / images / video
// //     const inlineExtensions = [
// //       "pdf",
// //       "jpg",
// //       "jpeg",
// //       "png",
// //       "gif",
// //       "mp4",
// //       "webm",
// //       "mov",
// //       "avi",
// //     ];
// //     const extWithoutDot = ext.replace(".", "");

// //     res.setHeader(
// //       "Content-Disposition",
// //       inlineExtensions.includes(extWithoutDot)
// //         ? `inline; filename="${path.basename(filename)}"`
// //         : `attachment; filename="${path.basename(filename)}"`
// //     );

// //     // Add CORS headers for public access
// //     res.setHeader("Access-Control-Allow-Origin", "*");
// //     res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

// //     // Stream the file
// //     const fileStream = fsSync.createReadStream(filePath);

// //     fileStream.on("error", (error) => {
// //       console.error(`❌ Error streaming file ${filename}:`, error.message);
// //       if (!res.headersSent) {
// //         res.status(500).json({
// //           success: false,
// //           error: "Error streaming file",
// //           details: error.message,
// //         });
// //       }
// //     });

// //     fileStream.pipe(res);

// //     console.log(`✅ File served successfully: ${filename} (from: ${foundIn})`);
// //   } catch (err) {
// //     console.error("❌ File server error:", err.message);

// //     // Check if headers were already sent
// //     if (!res.headersSent) {
// //       return res.status(500).json({
// //         success: false,
// //         error: "Failed to load file",
// //         details:
// //           process.env.NODE_ENV === "development" ? err.message : undefined,
// //       });
// //     }
// //   }
// // });

// // export default router;





// // routes/files.js
// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import fsSync from "fs";
// import { fileURLToPath } from "url";
// import cloudinary from '../utils/cloudinary.js';

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
//    Check if file is Cloudinary URL and redirect
// --------------------------------------------------------------- */
// const isCloudinaryUrl = (url) => {
//   return url && url.includes('cloudinary.com');
// };

// /* ---------------------------------------------------------------
//    PUBLIC PREVIEW LESSON ENDPOINT
// --------------------------------------------------------------- */
// router.get("/preview-lesson/:lessonId", async (req, res) => {
//   try {
//     const { lessonId } = req.params;

//     console.log("🔓 PUBLIC ACCESS - Preview lesson requested:", lessonId);

//     const db = await import("../models/index.js");
//     const { Lesson, Course } = db.default;

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [{ model: Course, as: "course" }],
//     });

//     if (!lesson) {
//       console.log("❌ Preview lesson not found:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Preview lesson not found",
//       });
//     }

//     const data = lesson.toJSON();

//     // Cloudinary URLs are already full URLs, no need to modify
//     // Only modify local paths
//     if (!isCloudinaryUrl(data.video_url) && data.video_url && !data.video_url.startsWith("http")) {
//       const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`)
//         .replace(/\/+$/, "");
//       const cleanUrl = data.video_url.replace(/^Uploads\//, "").replace(/^\/+/, "");
//       data.video_url = `${backend}/api/v1/files/${encodeURIComponent(cleanUrl)}`;
//     }

//     if (!isCloudinaryUrl(data.file_url) && data.file_url && !data.file_url.startsWith("http")) {
//       const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`)
//         .replace(/\/+$/, "");
//       const cleanUrl = data.file_url.replace(/^Uploads\//, "").replace(/^\/+/, "");
//       data.file_url = `${backend}/api/v1/files/${encodeURIComponent(cleanUrl)}`;
//     }

//     console.log("✅ Public preview served successfully:", {
//       lessonId: data.id,
//       title: data.title,
//       is_preview: data.is_preview,
//       course: data.course?.title,
//       isCloudinaryVideo: isCloudinaryUrl(data.video_url),
//       isCloudinaryFile: isCloudinaryUrl(data.file_url),
//     });

//     return res.json({
//       success: true,
//       lesson: data,
//       access: "public",
//       message: "Public preview access granted",
//     });
//   } catch (err) {
//     console.error("❌ Public preview error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//     });
//   }
// });

// /* ---------------------------------------------------------------
//    UNIVERSAL FILE SERVER
//    - Redirects Cloudinary URLs to Cloudinary
//    - Serves local files for development
// --------------------------------------------------------------- */
// router.get("/:filename", async (req, res) => {
//   try {
//     let { filename } = req.params;

//     // Security: strip paths and decode URL encoding
//     filename = path.basename(decodeURIComponent(filename));

//     console.log(`📁 File request: ${filename}`);

//     // Check if it's a Cloudinary URL pattern
//     if (filename.includes('cloudinary.com')) {
//       // This is already a Cloudinary URL, redirect to it
//       return res.redirect(301, filename);
//     }

//     // Check if file exists locally
//     const localPath = path.join(UPLOADS_DIR, filename);
    
//     if (fsSync.existsSync(localPath)) {
//       // Serve local file
//       const ext = path.extname(filename).toLowerCase();
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
//           ? `inline; filename="${path.basename(filename)}"`
//           : `attachment; filename="${path.basename(filename)}"`
//       );

//       res.setHeader("Access-Control-Allow-Origin", "*");
//       res.setHeader("Cache-Control", "public, max-age=86400");

//       const fileStream = fsSync.createReadStream(localPath);
//       fileStream.pipe(res);
      
//       console.log(`✅ Local file served: ${filename}`);
      
//     } else {
//       // File not found locally
//       console.log(`❌ File not found: ${filename}`);
      
//       // Check if this might be a migrated Cloudinary file
//       const knownFiles = [
//         "Examples-1764983251988.pdf",
//         "Class_work_on_increasing_and_decreasing_intervals__1_-1765036096606.pdf",
//         "sample-lesson.pdf",
//         "default-course.jpg",
//       ];
      
//       if (knownFiles.includes(filename)) {
//         // This file was likely migrated to Cloudinary
//         // Try to find it in the database
//         const db = await import("../models/index.js");
//         const { Lesson, Course } = db.default;
        
//         // Search for lessons with this filename
//         const lessons = await Lesson.findAll({
//           where: {
//             [db.default.Sequelize.Op.or]: [
//               { video_url: { [db.default.Sequelize.Op.like]: `%${filename}%` } },
//               { file_url: { [db.default.Sequelize.Op.like]: `%${filename}%` } }
//             ]
//           }
//         });
        
//         if (lessons.length > 0) {
//           // Found in database, check if it's a Cloudinary URL
//           for (const lesson of lessons) {
//             const videoUrl = lesson.video_url;
//             const fileUrl = lesson.file_url;
            
//             if (videoUrl && videoUrl.includes('cloudinary') && videoUrl.includes(filename)) {
//               return res.redirect(301, videoUrl);
//             }
//             if (fileUrl && fileUrl.includes('cloudinary') && fileUrl.includes(filename)) {
//               return res.redirect(301, fileUrl);
//             }
//           }
//         }
//       }
      
//       // Return 404
//       return res.status(404).json({
//         success: false,
//         error: `File not found: ${filename}`,
//         searchedDirectory: UPLOADS_DIR,
//         message: "The requested file could not be found on the server.",
//         suggestion: "This file may have been migrated to Cloudinary storage."
//       });
//     }
    
//   } catch (err) {
//     console.error("❌ File server error:", err.message);
    
//     if (!res.headersSent) {
//       return res.status(500).json({
//         success: false,
//         error: "Failed to load file",
//         details: process.env.NODE_ENV === "development" ? err.message : undefined,
//       });
//     }
//   }
// });

// export default router;





// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";

// ✅ Add this import at the top
import { getPublicPreviewByLessonId } from "../controllers/lessonController.js";

import cloudinary from "../utils/cloudinary.js";

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
