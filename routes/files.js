// // routes/files.js
// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import multer from "multer";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const router = express.Router();

// // ✅ CORRECT UPLOADS DIRECTORY PATH
// const uploadsDir = path.join(process.cwd(), "Uploads");

// // Ensure Uploads directory exists
// const ensureUploadsDir = async () => {
//   try {
//     await fs.access(uploadsDir);
//   } catch (error) {
//     await fs.mkdir(uploadsDir, { recursive: true });
//     console.log("✅ Created Uploads directory");
//   }
// };

// // Initialize directory on server start
// ensureUploadsDir();

// /* ============================================================
//    🎯 ENHANCED LESSON PREVIEW ENDPOINTS
// ============================================================ */

// /**
//  * ✅ DEBUG: Test preview access and lesson data
//  * GET /api/v1/files/debug-preview/:lessonId
//  */
// router.get("/debug-preview/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;
    
//     console.log("🔍 DEBUG PREVIEW - Lesson ID:", lessonId);
//     console.log("🔍 DEBUG PREVIEW - User ID:", userId);
//     console.log("🔍 DEBUG PREVIEW - User Role:", req.user.role);

//     // Import database models
//     const db = await import("../models/index.js");
    
//     // Find lesson with course information
//     const lesson = await db.default.Lesson.findByPk(lessonId, {
//       include: [{
//         model: db.default.Course,
//         as: "course",
//         attributes: ['id', 'title', 'teacher_id']
//       }],
//       attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview", "course_id"]
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found for preview:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found"
//       });
//     }

//     console.log("✅ Lesson found for preview:", {
//       id: lesson.id,
//       title: lesson.title,
//       content_type: lesson.content_type,
//       file_url: lesson.file_url,
//       video_url: lesson.video_url,
//       is_preview: lesson.is_preview,
//       course_teacher_id: lesson.course?.teacher_id,
//       current_user_id: userId
//     });

//     // Check access permissions
//     const isTeacher = lesson.course?.teacher_id === userId;
//     const isPreviewLesson = lesson.is_preview;
//     const isAdmin = req.user.role === "admin";

//     console.log("🔐 Access check:", {
//       isTeacher,
//       isPreviewLesson,
//       isAdmin,
//       hasAccess: isTeacher || isPreviewLesson || isAdmin
//     });

//     res.json({
//       success: true,
//       lesson: {
//         id: lesson.id,
//         title: lesson.title,
//         content_type: lesson.content_type,
//         file_url: lesson.file_url,
//         video_url: lesson.video_url,
//         is_preview: lesson.is_preview,
//         course_id: lesson.course_id,
//         course_teacher_id: lesson.course?.teacher_id
//       },
//       access: {
//         user_id: userId,
//         user_role: req.user.role,
//         is_teacher: isTeacher,
//         is_preview_lesson: isPreviewLesson,
//         is_admin: isAdmin,
//         has_access: isTeacher || isPreviewLesson || isAdmin
//       },
//       preview_url: `/api/v1/files/preview-lesson/${lessonId}`,
//       full_preview_url: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/preview-lesson/${lessonId}`
//     });
    
//   } catch (error) {
//     console.error("❌ DEBUG PREVIEW Error:", error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// /**
//  * ✅ ENHANCED: DEDICATED LESSON PREVIEW ENDPOINT
//  * GET /api/v1/files/preview-lesson/:lessonId
//  */
// router.get("/preview-lesson/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;
    
//     console.log("🔍 PREVIEW REQUEST:", { 
//       lessonId, 
//       userId,
//       userRole: req.user.role 
//     });

//     // Import database models
//     const db = await import("../models/index.js");
    
//     // Find lesson with course information
//     const lesson = await db.default.Lesson.findByPk(lessonId, {
//       include: [{
//         model: db.default.Course,
//         as: "course",
//         attributes: ['id', 'title', 'teacher_id']
//       }],
//       attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview", "course_id"]
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found for preview:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found"
//       });
//     }

//     console.log("✅ Lesson found for preview:", {
//       id: lesson.id,
//       title: lesson.title,
//       content_type: lesson.content_type,
//       file_url: lesson.file_url,
//       video_url: lesson.video_url,
//       is_preview: lesson.is_preview,
//       course_teacher_id: lesson.course?.teacher_id,
//       current_user_id: userId
//     });

//     // Check access permissions
//     const isTeacher = lesson.course?.teacher_id === userId;
//     const isPreviewLesson = lesson.is_preview;
//     const isAdmin = req.user.role === "admin";

//     console.log("🔐 Access check:", {
//       isTeacher,
//       isPreviewLesson,
//       isAdmin,
//       hasAccess: isTeacher || isPreviewLesson || isAdmin
//     });

//     // Allow access for: teachers, admins, or if lesson is marked as preview
//     if (!isTeacher && !isPreviewLesson && !isAdmin) {
//       console.log("🚫 Access denied for user:", userId);
//       return res.status(403).json({
//         success: false,
//         error: "Access denied. This lesson is not available for preview.",
//         details: "You need to be the teacher, an admin, or the lesson must be marked as preview"
//       });
//     }

//     console.log("✅ Access granted for preview");

//     // Handle different content types
//     if (lesson.content_type === 'pdf' && lesson.file_url) {
//       console.log("📄 Handling PDF preview");
//       await handlePdfPreview(lesson, res);
//     } else if (lesson.content_type === 'video' && lesson.video_url) {
//       console.log("🎥 Handling video preview");
//       await handleVideoPreview(lesson, res);
//     } else {
//       console.log("📝 Handling text preview");
//       await handleTextPreview(lesson, isPreviewLesson, res);
//     }
    
//   } catch (error) {
//     console.error("❌ PREVIEW ERROR:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to preview lesson content",
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// /**
//  * Handle PDF file preview
//  */
// async function handlePdfPreview(lesson, res) {
//   let filename = lesson.file_url;
  
//   // Handle different URL formats
//   if (filename.startsWith('/Uploads/')) {
//     filename = filename.replace('/Uploads/', '');
//   } else if (filename.startsWith('/api/v1/files/Uploads/')) {
//     filename = filename.replace('/api/v1/files/Uploads/', '');
//   } else if (filename.startsWith('http')) {
//     const urlObj = new URL(filename);
//     filename = path.basename(urlObj.pathname);
//   }
  
//   const safeFilename = path.basename(filename);
//   let filePath = path.join(uploadsDir, safeFilename);

//   console.log("📄 Processing PDF:", { original: lesson.file_url, filename: safeFilename, path: filePath });

//   // Check if file exists with fallback paths
//   try {
//     await fs.access(filePath);
//     console.log("✅ PDF file found:", filePath);
//   } catch (error) {
//     console.log("❌ PDF not found, trying alternative paths...");
    
//     const alternativePaths = [
//       path.join(uploadsDir, lesson.file_url),
//       path.join(__dirname, '..', lesson.file_url),
//       path.join(process.cwd(), lesson.file_url)
//     ];
    
//     let foundPath = null;
//     for (const altPath of alternativePaths) {
//       try {
//         await fs.access(altPath);
//         foundPath = altPath;
//         console.log("✅ File found at alternative path:", altPath);
//         break;
//       } catch (e) {
//         // Continue to next path
//       }
//     }
    
//     if (!foundPath) {
//       throw new Error(`PDF file not found: ${safeFilename}. Checked: ${filePath}`);
//     }
//     filePath = foundPath;
//   }

//   // Serve the PDF file
//   const stats = await fs.stat(filePath);
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Length', stats.size);
//   res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
//   res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  
//   console.log("📤 Serving PDF:", { filename: safeFilename, size: stats.size });
  
//   const fileStream = fs.createReadStream(filePath);
//   fileStream.pipe(res);
// }

// /**
//  * Handle video preview
//  */
// async function handleVideoPreview(lesson, res) {
//   console.log("🎥 Processing video:", lesson.video_url);
  
//   let videoUrl = lesson.video_url;
  
//   // Make relative URLs absolute
//   if (videoUrl.startsWith('/')) {
//     videoUrl = `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}${videoUrl}`;
//   }
  
//   console.log("🎥 Redirecting to video:", videoUrl);
//   return res.redirect(videoUrl);
// }

// /**
//  * Handle text content preview
//  */
// async function handleTextPreview(lesson, isPreviewLesson, res) {
//   console.log("📝 Serving text preview:", lesson.title);
  
//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Preview: ${lesson.title}</title>
//       <meta charset="utf-8">
//       <style>
//         body { 
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//           padding: 30px; 
//           max-width: 1000px; 
//           margin: 0 auto; 
//           line-height: 1.6;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           min-height: 100vh;
//         }
//         .preview-container {
//           background: white;
//           border-radius: 15px;
//           padding: 40px;
//           box-shadow: 0 20px 40px rgba(0,0,0,0.1);
//           border: 1px solid rgba(255,255,255,0.2);
//         }
//         .header { 
//           border-bottom: 3px solid #667eea; 
//           padding-bottom: 20px; 
//           margin-bottom: 30px; 
//           text-align: center;
//         }
//         .header h1 {
//           color: #2d3748;
//           margin: 0;
//           font-size: 2.5em;
//         }
//         .content { 
//           white-space: pre-wrap;
//           background: #f8f9fa;
//           padding: 30px;
//           border-radius: 10px;
//           border-left: 5px solid #667eea;
//           font-size: 1.1em;
//           color: #2d3748;
//         }
//         .info {
//           background: #e3f2fd;
//           padding: 20px;
//           border-radius: 10px;
//           margin-bottom: 30px;
//           border-left: 5px solid #2196f3;
//         }
//         .info p {
//           margin: 8px 0;
//           color: #1565c0;
//           font-weight: 500;
//         }
//         .watermark {
//           text-align: center;
//           margin-top: 40px;
//           color: #666;
//           font-style: italic;
//           border-top: 1px solid #ddd;
//           padding-top: 20px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="preview-container">
//         <div class="header">
//           <h1>${lesson.title}</h1>
//         </div>
//         <div class="info">
//           <p><strong>Content Type:</strong> ${lesson.content_type}</p>
//           <p><strong>Preview Type:</strong> ${isPreviewLesson ? 'Free Preview' : 'Teacher/Admin Preview'}</p>
//           <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
//         </div>
//         <div class="content">
//           ${lesson.content || 'No content available for this lesson.'}
//         </div>
//         <div class="watermark">
//           Lesson Preview - Generated by Learning Platform
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   res.send(htmlContent);
// }

// /**
//  * ✅ DEBUG ENDPOINT: Test file access and lesson data
//  * GET /api/v1/files/debug-lesson/:lessonId
//  */
// router.get("/debug-lesson/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
    
//     console.log("🐛 Debug request for lesson:", lessonId);

//     const db = await import("../models/index.js");
//     const lesson = await db.default.Lesson.findByPk(lessonId, {
//       include: [{
//         model: db.default.Course,
//         as: "course",
//         attributes: ['id', 'title', 'teacher_id']
//       }],
//       attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview"]
//     });

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found"
//       });
//     }

//     // Check file existence if it's a PDF
//     let fileExists = false;
//     let filePath = null;
//     let fileDetails = null;
    
//     if (lesson.content_type === 'pdf' && lesson.file_url) {
//       let filename = lesson.file_url;
//       if (filename.startsWith('/Uploads/')) {
//         filename = filename.replace('/Uploads/', '');
//       }
//       const safeFilename = path.basename(filename);
//       filePath = path.join(uploadsDir, safeFilename);
      
//       try {
//         await fs.access(filePath);
//         fileExists = true;
//         const stats = await fs.stat(filePath);
//         fileDetails = {
//           exists: true,
//           path: filePath,
//           size: stats.size,
//           sizeFormatted: formatFileSize(stats.size),
//           modified: stats.mtime
//         };
//       } catch (error) {
//         fileExists = false;
//         fileDetails = {
//           exists: false,
//           path: filePath,
//           error: error.message
//         };
//       }
//     }

//     res.json({
//       success: true,
//       lesson: {
//         id: lesson.id,
//         title: lesson.title,
//         content_type: lesson.content_type,
//         file_url: lesson.file_url,
//         video_url: lesson.video_url,
//         is_preview: lesson.is_preview,
//         course: {
//           id: lesson.course?.id,
//           title: lesson.course?.title,
//           teacher_id: lesson.course?.teacher_id
//         }
//       },
//       file_info: fileDetails || { exists: false, message: 'Not a PDF lesson' },
//       uploads_directory: uploadsDir,
//       preview_urls: {
//         direct: `/api/v1/files/preview-lesson/${lessonId}`,
//         full: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/preview-lesson/${lessonId}`
//       },
//       access: {
//         user_id: req.user.id,
//         user_role: req.user.role,
//         is_teacher: lesson.course?.teacher_id === req.user.id,
//         has_access: lesson.course?.teacher_id === req.user.id || lesson.is_preview || req.user.role === 'admin'
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Debug error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// /* ============================================================
//    📁 FILE SERVING ROUTES
// ============================================================ */

// /**
//  * ✅ UNIVERSAL FILE SERVING ROUTE
//  * This handles ALL file requests from /Uploads/ path
//  */
// const serveFile = async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     // ✅ Security - prevent directory traversal attacks
//     const safeFilename = path.basename(filename);
//     const filePath = path.join(uploadsDir, safeFilename);

//     console.log("📁 Serving file:", { 
//       requested: filename, 
//       safeFilename, 
//       filePath,
//       uploadsDirExists: fs.existsSync(uploadsDir)
//     });

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//       console.log("✅ File found:", filePath);
//     } catch (error) {
//       console.log("❌ File not found:", safeFilename, "at path:", filePath);
//       return res.status(404).json({
//         success: false,
//         error: `File not found: ${safeFilename}`,
//         path: filePath,
//         uploadsDir: uploadsDir
//       });
//     }

//     // Get file stats
//     const stats = await fs.stat(filePath);
    
//     // Detect MIME type based on extension
//     const ext = path.extname(safeFilename).toLowerCase();
//     const mimeTypes = {
//       '.pdf': 'application/pdf',
//       '.jpg': 'image/jpeg',
//       '.jpeg': 'image/jpeg',
//       '.png': 'image/png',
//       '.gif': 'image/gif',
//       '.txt': 'text/plain',
//       '.mp4': 'video/mp4',
//       '.mp3': 'audio/mpeg',
//       '.doc': 'application/msword',
//       '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       '.zip': 'application/zip',
//       '.mov': 'video/quicktime',
//       '.avi': 'video/x-msvideo'
//     };

//     const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
//     console.log("📄 File details:", {
//       filename: safeFilename,
//       size: stats.size,
//       mimeType: mimeType,
//       extension: ext
//     });
    
//     // Set appropriate headers
//     res.setHeader('Content-Type', mimeType);
//     res.setHeader('Content-Length', stats.size);
//     res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
//     // For certain file types, allow inline display in browser
//     if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
//       res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
//     } else {
//       res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
//     }
    
//     // Enable CORS for frontend access
//     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
//     // Create read stream and pipe to response
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
    
//     fileStream.on('error', (error) => {
//       console.error("❌ File stream error:", error);
//       if (!res.headersSent) {
//         res.status(500).json({
//           success: false,
//           error: "Error reading file",
//         });
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error serving file:", error);
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         error: "Failed to serve file",
//         details: error.message,
//       });
//     }
//   }
// };

// // Register multiple route patterns to catch all variations
// router.get("/Uploads/:filename", serveFile);
// router.get("/uploads/:filename", serveFile);

// /**
//  * ✅ LEGACY ROUTE - Direct file access (for backward compatibility)
//  * GET /api/v1/files/:filename
//  */
// router.get("/:filename", async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     // Skip if it's one of our API endpoints
//     if (filename === 'uploads' || filename === 'Uploads' || 
//         filename === 'preview' || filename === 'download' || 
//         filename === 'stats' || filename === 'upload') {
//       return res.status(404).json({
//         success: false,
//         error: "Endpoint not found"
//       });
//     }
    
//     console.log("📁 Legacy route serving file:", filename);
//     await serveFile(req, res);
//   } catch (error) {
//     console.error("❌ Legacy route error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to serve file",
//     });
//   }
// });

// /**
//  * ✅ Get all files with metadata (Admin only)
//  * GET /api/v1/files
//  */
// router.get("/", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     await ensureUploadsDir();

//     const files = await fs.readdir(uploadsDir);

//     const filesWithMetadata = await Promise.all(
//       files.map(async (filename) => {
//         const filePath = path.join(uploadsDir, filename);
//         const stats = await fs.stat(filePath);

//         return {
//           name: filename,
//           path: `/Uploads/${filename}`,
//           fullPath: filePath,
//           size: stats.size,
//           sizeFormatted: formatFileSize(stats.size),
//           type: path.extname(filename).toLowerCase(),
//           modified: stats.mtime,
//           created: stats.birthtime,
//           isDirectory: stats.isDirectory(),
//         };
//       })
//     );

//     // Sort by modified date (newest first)
//     const sortedFiles = filesWithMetadata.sort(
//       (a, b) => new Date(b.modified) - new Date(a.modified)
//     );

//     res.json({
//       success: true,
//       files: sortedFiles,
//       totalFiles: sortedFiles.length,
//       totalSize: sortedFiles.reduce((sum, file) => sum + file.size, 0),
//       totalSizeFormatted: formatFileSize(sortedFiles.reduce((sum, file) => sum + file.size, 0)),
//       directory: uploadsDir,
//     });
//   } catch (error) {
//     console.error("❌ Error listing files:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to list files",
//       details: error.message,
//     });
//   }
// });

// /**
//  * ✅ Get file statistics
//  * GET /api/v1/files/stats
//  */
// router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     await ensureUploadsDir();

//     const files = await fs.readdir(uploadsDir);
//     let totalSize = 0;
//     const fileTypes = {};

//     for (const filename of files) {
//       const filePath = path.join(uploadsDir, filename);
//       const stats = await fs.stat(filePath);
//       totalSize += stats.size;

//       const ext = path.extname(filename).toLowerCase() || "no-extension";
//       fileTypes[ext] = (fileTypes[ext] || 0) + 1;
//     }

//     res.json({
//       success: true,
//       stats: {
//         totalFiles: files.length,
//         totalSize,
//         totalSizeFormatted: formatFileSize(totalSize),
//         fileTypes,
//         directory: uploadsDir,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error getting file stats:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to get file statistics",
//     });
//   }
// });

// /**
//  * ✅ Preview File (PDF/Image) Inline in Browser
//  * GET /api/v1/files/preview/:filename
//  */
// router.get("/preview/:filename", authenticateToken, async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     const safeFilename = path.basename(filename);
//     const filePath = path.join(uploadsDir, safeFilename);

//     await fs.access(filePath);

//     const ext = path.extname(safeFilename).toLowerCase();
//     const mimeTypes = {
//       ".pdf": "application/pdf",
//       ".jpg": "image/jpeg",
//       ".jpeg": "image/jpeg",
//       ".png": "image/png",
//       ".gif": "image/gif",
//       ".txt": "text/plain",
//     };

//     const mimeType = mimeTypes[ext] || "application/octet-stream";
    
//     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
//     res.setHeader("Content-Type", mimeType);
    
//     if (ext === '.pdf') {
//       res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
//     }
    
//     res.sendFile(filePath);
//   } catch (error) {
//     console.error("❌ File preview error:", error);
//     res.status(404).json({
//       success: false,
//       error: "File not found",
//     });
//   }
// });

// /**
//  * ✅ Download File Securely
//  * GET /api/v1/files/download/:filename
//  */
// router.get("/download/:filename", authenticateToken, async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     const safeFilename = path.basename(filename);
//     const filePath = path.join(uploadsDir, safeFilename);

//     await fs.access(filePath);

//     res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
//     res.download(filePath, safeFilename, (err) => {
//       if (err) {
//         console.error("❌ Download error:", err);
//         if (!res.headersSent) {
//           res.status(500).json({
//             success: false,
//             error: "Download failed",
//             details: err.message,
//           });
//         }
//       }
//     });
//   } catch (error) {
//     console.error("❌ File download error:", error);
//     res.status(404).json({
//       success: false,
//       error: "File not found",
//     });
//   }
// });

// /**
//  * ✅ Delete File (Admin only)
//  * DELETE /api/v1/files/delete/:filename
//  */
// router.delete(
//   "/delete/:filename",
//   authenticateToken,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const { filename } = req.params;
      
//       const safeFilename = path.basename(filename);
//       const filePath = path.join(uploadsDir, safeFilename);

//       await fs.access(filePath);
//       await fs.unlink(filePath);

//       console.log(`✅ File deleted: ${safeFilename}`);
//       res.json({
//         success: true,
//         message: `File "${safeFilename}" deleted successfully`,
//       });
//     } catch (error) {
//       console.error("❌ File deletion error:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to delete file",
//         details: error.message,
//       });
//     }
//   }
// );

// /**
//  * ✅ Upload File
//  * POST /api/v1/files/upload
//  */
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     ensureUploadsDir().then(() => {
//       cb(null, uploadsDir);
//     }).catch(err => {
//       cb(err, uploadsDir);
//     });
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
//     const uniqueName = `${timestamp}-${safeName}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { 
//     fileSize: 100 * 1024 * 1024
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "application/pdf",
//       "text/plain",
//       "video/mp4",
//       "video/mpeg",
//       "video/quicktime",
//       "video/x-msvideo",
//       "audio/mpeg",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/zip"
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`File type ${file.mimetype} not allowed`), false);
//     }
//   },
// });

// router.post(
//   "/upload",
//   authenticateToken,
//   isAdmin,
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "No file uploaded or file type not allowed",
//         });
//       }

//       const fileInfo = {
//         name: req.file.filename,
//         originalName: req.file.originalname,
//         path: `/Uploads/${req.file.filename}`,
//         fullUrl: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/Uploads/${req.file.filename}`,
//         size: req.file.size,
//         sizeFormatted: formatFileSize(req.file.size),
//         type: path.extname(req.file.originalname).toLowerCase(),
//         mimetype: req.file.mimetype,
//         uploadedAt: new Date().toISOString()
//       };

//       console.log(`✅ File uploaded: ${fileInfo.name} (${fileInfo.sizeFormatted})`);
      
//       res.json({
//         success: true,
//         message: "File uploaded successfully",
//         file: fileInfo,
//       });
//     } catch (error) {
//       console.error("❌ File upload error:", error);
//       res.status(500).json({
//         success: false,
//         error: "File upload failed",
//         details: error.message,
//       });
//     }
//   }
// );

// /**
//  * ✅ Upload Multiple Files
//  * POST /api/v1/files/upload-multiple
//  */
// router.post(
//   "/upload-multiple",
//   authenticateToken,
//   isAdmin,
//   upload.array("files", 10),
//   async (req, res) => {
//     try {
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({
//           success: false,
//           error: "No files uploaded",
//         });
//       }

//       const uploadedFiles = req.files.map(file => ({
//         name: file.filename,
//         originalName: file.originalname,
//         path: `/Uploads/${file.filename}`,
//         fullUrl: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/Uploads/${file.filename}`,
//         size: file.size,
//         sizeFormatted: formatFileSize(file.size),
//         type: path.extname(file.originalname).toLowerCase(),
//         mimetype: file.mimetype,
//         uploadedAt: new Date().toISOString()
//       }));

//       console.log(`✅ ${uploadedFiles.length} files uploaded successfully`);
      
//       res.json({
//         success: true,
//         message: `${uploadedFiles.length} files uploaded successfully`,
//         files: uploadedFiles,
//       });
//     } catch (error) {
//       console.error("❌ Multiple file upload error:", error);
//       res.status(500).json({
//         success: false,
//         error: "File upload failed",
//         details: error.message,
//       });
//     }
//   }
// );

// /* ============================================================
//    🔧 HELPER FUNCTIONS
// ============================================================ */

// function formatFileSize(bytes) {
//   if (bytes === 0) return "0 Bytes";

//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// export default router;




// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ CORRECT UPLOADS DIRECTORY PATH
const uploadsDir = path.join(process.cwd(), "Uploads");

// Ensure Uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log("✅ Created Uploads directory");
  }
};

// Initialize directory on server start
ensureUploadsDir();

/**
 * ✅ Helper function to check if user is enrolled in a course
 */
async function checkEnrollmentStatus(userId, courseId) {
  try {
    const db = await import("../models/index.js");
    const enrollment = await db.default.Enrollment.findOne({
      where: { 
        user_id: userId, 
        course_id: courseId,
        approval_status: "approved"
      }
    });
    return !!enrollment;
  } catch (error) {
    console.error("❌ Enrollment check error:", error);
    return false;
  }
}

/* ============================================================
   🎯 ENHANCED LESSON PREVIEW ENDPOINTS
============================================================ */

/**
 * ✅ DEBUG: Test preview access and lesson data
 * GET /api/v1/files/debug-preview/:lessonId
 */
router.get("/debug-preview/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    console.log("🔍 DEBUG PREVIEW - Lesson ID:", lessonId);
    console.log("🔍 DEBUG PREVIEW - User ID:", userId);
    console.log("🔍 DEBUG PREVIEW - User Role:", req.user.role);

    // Import database models
    const db = await import("../models/index.js");
    
    // Find lesson with course information
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      include: [{
        model: db.default.Course,
        as: "course",
        attributes: ['id', 'title', 'teacher_id']
      }],
      attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview", "course_id"]
    });

    if (!lesson) {
      console.log("❌ Lesson not found for preview:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    console.log("✅ Lesson found for preview:", {
      id: lesson.id,
      title: lesson.title,
      content_type: lesson.content_type,
      file_url: lesson.file_url,
      video_url: lesson.video_url,
      is_preview: lesson.is_preview,
      course_teacher_id: lesson.course?.teacher_id,
      current_user_id: userId
    });

    // Check access permissions
    const isTeacher = lesson.course?.teacher_id === userId;
    const isPreviewLesson = lesson.is_preview;
    const isAdmin = req.user.role === "admin";
    const isEnrolled = await checkEnrollmentStatus(userId, lesson.course_id);

    console.log("🔐 Access check:", {
      isTeacher,
      isPreviewLesson,
      isAdmin,
      isEnrolled,
      hasAccess: isTeacher || isPreviewLesson || isAdmin || isEnrolled
    });

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content_type: lesson.content_type,
        file_url: lesson.file_url,
        video_url: lesson.video_url,
        is_preview: lesson.is_preview,
        course_id: lesson.course_id,
        course_teacher_id: lesson.course?.teacher_id
      },
      access: {
        user_id: userId,
        user_role: req.user.role,
        is_teacher: isTeacher,
        is_preview_lesson: isPreviewLesson,
        is_admin: isAdmin,
        is_enrolled: isEnrolled,
        has_access: isTeacher || isPreviewLesson || isAdmin || isEnrolled
      },
      preview_url: `/api/v1/files/preview-lesson/${lessonId}`,
      full_preview_url: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/preview-lesson/${lessonId}`
    });
    
  } catch (error) {
    console.error("❌ DEBUG PREVIEW Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * ✅ ENHANCED: DEDICATED LESSON PREVIEW ENDPOINT
 * GET /api/v1/files/preview-lesson/:lessonId
 */
router.get("/preview-lesson/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    console.log("🔍 PREVIEW REQUEST:", { 
      lessonId, 
      userId,
      userRole: req.user.role 
    });

    // Validate lessonId
    if (!lessonId || isNaN(parseInt(lessonId))) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID"
      });
    }

    // Import database models
    const db = await import("../models/index.js");
    
    // Find lesson with course information
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      include: [{
        model: db.default.Course,
        as: "course",
        attributes: ['id', 'title', 'teacher_id']
      }],
      attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview", "course_id"]
    });

    if (!lesson) {
      console.log("❌ Lesson not found for preview:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    console.log("✅ Lesson found for preview:", {
      id: lesson.id,
      title: lesson.title,
      content_type: lesson.content_type,
      file_url: lesson.file_url,
      video_url: lesson.video_url,
      is_preview: lesson.is_preview,
      course_teacher_id: lesson.course?.teacher_id,
      current_user_id: userId
    });

    // Check access permissions - ENHANCED: Include enrollment check
    const isTeacher = lesson.course?.teacher_id === userId;
    const isPreviewLesson = lesson.is_preview;
    const isAdmin = req.user.role === "admin";
    const isEnrolled = await checkEnrollmentStatus(userId, lesson.course_id);

    console.log("🔐 Access check:", {
      isTeacher,
      isPreviewLesson,
      isAdmin,
      isEnrolled,
      hasAccess: isTeacher || isPreviewLesson || isAdmin || isEnrolled
    });

    // Allow access for: teachers, admins, enrolled students, or if lesson is marked as preview
    if (!isTeacher && !isPreviewLesson && !isAdmin && !isEnrolled) {
      console.log("🚫 Access denied for user:", userId);
      return res.status(403).json({
        success: false,
        error: "Access denied. You are not enrolled in this course.",
        details: "You need to be enrolled in the course, be the teacher, an admin, or the lesson must be marked as preview"
      });
    }

    console.log("✅ Access granted for preview");

    // Handle different content types
    if (lesson.content_type === 'pdf' && lesson.file_url) {
      console.log("📄 Handling PDF preview");
      await handlePdfPreview(lesson, res);
    } else if (lesson.content_type === 'video' && lesson.video_url) {
      console.log("🎥 Handling video preview");
      await handleVideoPreview(lesson, res);
    } else if (lesson.content_type === 'text') {
      console.log("📝 Handling text preview");
      await handleTextPreview(lesson, isPreviewLesson, res);
    } else {
      console.log("❓ Unknown content type:", lesson.content_type);
      return res.status(400).json({
        success: false,
        error: `Unsupported content type: ${lesson.content_type}`
      });
    }
    
  } catch (error) {
    console.error("❌ PREVIEW ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to preview lesson content",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Handle PDF file preview
 */
async function handlePdfPreview(lesson, res) {
  let filename = lesson.file_url;
  
  // Handle different URL formats
  if (filename.startsWith('/Uploads/')) {
    filename = filename.replace('/Uploads/', '');
  } else if (filename.startsWith('/api/v1/files/Uploads/')) {
    filename = filename.replace('/api/v1/files/Uploads/', '');
  } else if (filename.startsWith('http')) {
    const urlObj = new URL(filename);
    filename = path.basename(urlObj.pathname);
  }
  
  const safeFilename = path.basename(filename);
  let filePath = path.join(uploadsDir, safeFilename);

  console.log("📄 Processing PDF:", { original: lesson.file_url, filename: safeFilename, path: filePath });

  // Check if file exists with fallback paths
  try {
    await fs.access(filePath);
    console.log("✅ PDF file found:", filePath);
  } catch (error) {
    console.log("❌ PDF not found, trying alternative paths...");
    
    const alternativePaths = [
      path.join(uploadsDir, lesson.file_url),
      path.join(__dirname, '..', lesson.file_url),
      path.join(process.cwd(), lesson.file_url)
    ];
    
    let foundPath = null;
    for (const altPath of alternativePaths) {
      try {
        await fs.access(altPath);
        foundPath = altPath;
        console.log("✅ File found at alternative path:", altPath);
        break;
      } catch (e) {
        // Continue to next path
      }
    }
    
    if (!foundPath) {
      throw new Error(`PDF file not found: ${safeFilename}. Checked: ${filePath}`);
    }
    filePath = foundPath;
  }

  // Serve the PDF file
  const stats = await fs.stat(filePath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  
  console.log("📤 Serving PDF:", { filename: safeFilename, size: stats.size });
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}

/**
 * Handle video preview
 */
async function handleVideoPreview(lesson, res) {
  console.log("🎥 Processing video:", lesson.video_url);
  
  let videoUrl = lesson.video_url;
  
  // Make relative URLs absolute
  if (videoUrl.startsWith('/')) {
    videoUrl = `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}${videoUrl}`;
  }
  
  console.log("🎥 Redirecting to video:", videoUrl);
  return res.redirect(videoUrl);
}

/**
 * Handle text content preview
 */
async function handleTextPreview(lesson, isPreviewLesson, res) {
  console.log("📝 Serving text preview:", lesson.title);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Preview: ${lesson.title}</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 30px; 
          max-width: 1000px; 
          margin: 0 auto; 
          line-height: 1.6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .preview-container {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .header { 
          border-bottom: 3px solid #667eea; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
          text-align: center;
        }
        .header h1 {
          color: #2d3748;
          margin: 0;
          font-size: 2.5em;
        }
        .content { 
          white-space: pre-wrap;
          background: #f8f9fa;
          padding: 30px;
          border-radius: 10px;
          border-left: 5px solid #667eea;
          font-size: 1.1em;
          color: #2d3748;
        }
        .info {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          border-left: 5px solid #2196f3;
        }
        .info p {
          margin: 8px 0;
          color: #1565c0;
          font-weight: 500;
        }
        .watermark {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-style: italic;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="header">
          <h1>${lesson.title}</h1>
        </div>
        <div class="info">
          <p><strong>Content Type:</strong> ${lesson.content_type}</p>
          <p><strong>Preview Type:</strong> ${isPreviewLesson ? 'Free Preview' : 'Teacher/Admin Preview'}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">
          ${lesson.content || 'No content available for this lesson.'}
        </div>
        <div class="watermark">
          Lesson Preview - Generated by Learning Platform
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlContent);
}

/**
 * ✅ DEBUG: Check file upload and lesson data
 * GET /api/v1/files/debug-upload-info/:lessonId
 */
router.get("/debug-upload-info/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const db = await import("../models/index.js");
    
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      attributes: ["id", "title", "file_url", "content_type", "course_id"]
    });
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    // Check if file exists physically
    let fileExists = false;
    let filePath = null;
    if (lesson.file_url) {
      const filename = lesson.file_url.replace('/Uploads/', '');
      filePath = path.join(uploadsDir, filename);
      fileExists = fs.existsSync(filePath);
    }
    
    res.json({
      lesson: lesson.toJSON(),
      fileExists,
      filePath,
      uploadsDir,
      backendUrl: process.env.BACKEND_URL,
      constructedUrl: lesson.file_url ? `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files${lesson.file_url}` : null
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ DEBUG ENDPOINT: Test file access and lesson data
 * GET /api/v1/files/debug-lesson/:lessonId
 */
router.get("/debug-lesson/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    console.log("🐛 Debug request for lesson:", lessonId);

    const db = await import("../models/index.js");
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      include: [{
        model: db.default.Course,
        as: "course",
        attributes: ['id', 'title', 'teacher_id']
      }],
      attributes: ["id", "title", "file_url", "video_url", "content_type", "content", "is_preview", "course_id"]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    // Check file existence if it's a PDF
    let fileExists = false;
    let filePath = null;
    let fileDetails = null;
    
    if (lesson.content_type === 'pdf' && lesson.file_url) {
      let filename = lesson.file_url;
      if (filename.startsWith('/Uploads/')) {
        filename = filename.replace('/Uploads/', '');
      }
      const safeFilename = path.basename(filename);
      filePath = path.join(uploadsDir, safeFilename);
      
      try {
        await fs.access(filePath);
        fileExists = true;
        const stats = await fs.stat(filePath);
        fileDetails = {
          exists: true,
          path: filePath,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          modified: stats.mtime
        };
      } catch (error) {
        fileExists = false;
        fileDetails = {
          exists: false,
          path: filePath,
          error: error.message
        };
      }
    }

    // Check enrollment status
    const isEnrolled = await checkEnrollmentStatus(req.user.id, lesson.course_id);

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content_type: lesson.content_type,
        file_url: lesson.file_url,
        video_url: lesson.video_url,
        is_preview: lesson.is_preview,
        course: {
          id: lesson.course?.id,
          title: lesson.course?.title,
          teacher_id: lesson.course?.teacher_id
        }
      },
      file_info: fileDetails || { exists: false, message: 'Not a PDF lesson' },
      enrollment: {
        user_id: req.user.id,
        course_id: lesson.course_id,
        is_enrolled: isEnrolled
      },
      uploads_directory: uploadsDir,
      preview_urls: {
        direct: `/api/v1/files/preview-lesson/${lessonId}`,
        full: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/preview-lesson/${lessonId}`
      },
      access: {
        user_id: req.user.id,
        user_role: req.user.role,
        is_teacher: lesson.course?.teacher_id === req.user.id,
        is_enrolled: isEnrolled,
        has_access: lesson.course?.teacher_id === req.user.id || lesson.is_preview || req.user.role === 'admin' || isEnrolled
      }
    });
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ============================================================
   📁 FILE SERVING ROUTES
============================================================ */

/**
 * ✅ UNIVERSAL FILE SERVING ROUTE
 * This handles ALL file requests from /Uploads/ path
 */
const serveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // ✅ Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    console.log("📁 Serving file:", { 
      requested: filename, 
      safeFilename, 
      filePath,
      uploadsDirExists: fs.existsSync(uploadsDir)
    });

    // Check if file exists
    try {
      await fs.access(filePath);
      console.log("✅ File found:", filePath);
    } catch (error) {
      console.log("❌ File not found:", safeFilename, "at path:", filePath);
      return res.status(404).json({
        success: false,
        error: `File not found: ${safeFilename}`,
        path: filePath,
        uploadsDir: uploadsDir
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Detect MIME type based on extension
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.zip': 'application/zip',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    console.log("📄 File details:", {
      filename: safeFilename,
      size: stats.size,
      mimeType: mimeType,
      extension: ext
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // For certain file types, allow inline display in browser
    if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    }
    
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error("❌ File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error reading file",
        });
      }
    });

  } catch (error) {
    console.error("❌ Error serving file:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to serve file",
        details: error.message,
      });
    }
  }
};

// Register multiple route patterns to catch all variations
router.get("/Uploads/:filename", serveFile);
router.get("/uploads/:filename", serveFile);

/**
 * ✅ LEGACY ROUTE - Direct file access (for backward compatibility)
 * GET /api/v1/files/:filename
 */
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Skip if it's one of our API endpoints
    if (filename === 'uploads' || filename === 'Uploads' || 
        filename === 'preview' || filename === 'download' || 
        filename === 'stats' || filename === 'upload') {
      return res.status(404).json({
        success: false,
        error: "Endpoint not found"
      });
    }
    
    console.log("📁 Legacy route serving file:", filename);
    await serveFile(req, res);
  } catch (error) {
    console.error("❌ Legacy route error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to serve file",
    });
  }
});

/**
 * ✅ Get all files with metadata (Admin only)
 * GET /api/v1/files
 */
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    await ensureUploadsDir();

    const files = await fs.readdir(uploadsDir);

    const filesWithMetadata = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        return {
          name: filename,
          path: `/Uploads/${filename}`,
          fullPath: filePath,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          type: path.extname(filename).toLowerCase(),
          modified: stats.mtime,
          created: stats.birthtime,
          isDirectory: stats.isDirectory(),
        };
      })
    );

    // Sort by modified date (newest first)
    const sortedFiles = filesWithMetadata.sort(
      (a, b) => new Date(b.modified) - new Date(a.modified)
    );

    res.json({
      success: true,
      files: sortedFiles,
      totalFiles: sortedFiles.length,
      totalSize: sortedFiles.reduce((sum, file) => sum + file.size, 0),
      totalSizeFormatted: formatFileSize(sortedFiles.reduce((sum, file) => sum + file.size, 0)),
      directory: uploadsDir,
    });
  } catch (error) {
    console.error("❌ Error listing files:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list files",
      details: error.message,
    });
  }
});

/**
 * ✅ Get file statistics
 * GET /api/v1/files/stats
 */
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    await ensureUploadsDir();

    const files = await fs.readdir(uploadsDir);
    let totalSize = 0;
    const fileTypes = {};

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;

      const ext = path.extname(filename).toLowerCase() || "no-extension";
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    res.json({
      success: true,
      stats: {
        totalFiles: files.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        fileTypes,
        directory: uploadsDir,
      },
    });
  } catch (error) {
    console.error("❌ Error getting file stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get file statistics",
    });
  }
});

/**
 * ✅ Preview File (PDF/Image) Inline in Browser
 * GET /api/v1/files/preview/:filename
 */
router.get("/preview/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    await fs.access(filePath);

    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".txt": "text/plain",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader("Content-Type", mimeType);
    
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ File preview error:", error);
    res.status(404).json({
      success: false,
      error: "File not found",
    });
  }
});

/**
 * ✅ Download File Securely
 * GET /api/v1/files/download/:filename
 */
router.get("/download/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    await fs.access(filePath);

    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
    res.download(filePath, safeFilename, (err) => {
      if (err) {
        console.error("❌ Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Download failed",
            details: err.message,
          });
        }
      }
    });
  } catch (error) {
    console.error("❌ File download error:", error);
    res.status(404).json({
      success: false,
      error: "File not found",
    });
  }
});

/**
 * ✅ Delete File (Admin only)
 * DELETE /api/v1/files/delete/:filename
 */
router.delete(
  "/delete/:filename",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { filename } = req.params;
      
      const safeFilename = path.basename(filename);
      const filePath = path.join(uploadsDir, safeFilename);

      await fs.access(filePath);
      await fs.unlink(filePath);

      console.log(`✅ File deleted: ${safeFilename}`);
      res.json({
        success: true,
        message: `File "${safeFilename}" deleted successfully`,
      });
    } catch (error) {
      console.error("❌ File deletion error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete file",
        details: error.message,
      });
    }
  }
);

/**
 * ✅ Upload File
 * POST /api/v1/files/upload
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir().then(() => {
      cb(null, uploadsDir);
    }).catch(err => {
      cb(err, uploadsDir);
    });
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${timestamp}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

router.post(
  "/upload",
  authenticateToken,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded or file type not allowed",
        });
      }

      const fileInfo = {
        name: req.file.filename,
        originalName: req.file.originalname,
        path: `/Uploads/${req.file.filename}`,
        fullUrl: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/Uploads/${req.file.filename}`,
        size: req.file.size,
        sizeFormatted: formatFileSize(req.file.size),
        type: path.extname(req.file.originalname).toLowerCase(),
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      };

      console.log(`✅ File uploaded: ${fileInfo.name} (${fileInfo.sizeFormatted})`);
      
      res.json({
        success: true,
        message: "File uploaded successfully",
        file: fileInfo,
      });
    } catch (error) {
      console.error("❌ File upload error:", error);
      res.status(500).json({
        success: false,
        error: "File upload failed",
        details: error.message,
      });
    }
  }
);

/**
 * ✅ Upload Multiple Files
 * POST /api/v1/files/upload-multiple
 */
router.post(
  "/upload-multiple",
  authenticateToken,
  isAdmin,
  upload.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      const uploadedFiles = req.files.map(file => ({
        name: file.filename,
        originalName: file.originalname,
        path: `/Uploads/${file.filename}`,
        fullUrl: `${process.env.BACKEND_URL || 'https://mathe-class-website-backend-1.onrender.com'}/api/v1/files/Uploads/${file.filename}`,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: path.extname(file.originalname).toLowerCase(),
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));

      console.log(`✅ ${uploadedFiles.length} files uploaded successfully`);
      
      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("❌ Multiple file upload error:", error);
      res.status(500).json({
        success: false,
        error: "File upload failed",
        details: error.message,
      });
    }
  }
);

/* ============================================================
   🔧 HELPER FUNCTIONS
============================================================ */

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default router;