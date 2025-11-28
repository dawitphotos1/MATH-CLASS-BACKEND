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

// // UPLOADS DIRECTORY PATH
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

// /**
//  * Helper function to check if user is enrolled in a course
//  */
// async function checkEnrollmentStatus(userId, courseId) {
//   try {
//     const db = await import("../models/index.js");
//     const enrollment = await db.default.Enrollment.findOne({
//       where: { 
//         user_id: userId, 
//         course_id: courseId,
//         approval_status: "approved"
//       }
//     });
//     return !!enrollment;
//   } catch (error) {
//     console.error("❌ Enrollment check error:", error);
//     return false;
//   }
// }

// /**
//  * MAIN LESSON PREVIEW ENDPOINT
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

//     // Validate lessonId
//     if (!lessonId || isNaN(parseInt(lessonId))) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid lesson ID"
//       });
//     }

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
//     const isEnrolled = await checkEnrollmentStatus(userId, lesson.course_id);

//     console.log("🔐 Access check:", {
//       isTeacher,
//       isPreviewLesson,
//       isAdmin,
//       isEnrolled,
//       hasAccess: isTeacher || isPreviewLesson || isAdmin || isEnrolled
//     });

//     // Allow access for: teachers, admins, enrolled students, or if lesson is marked as preview
//     if (!isTeacher && !isPreviewLesson && !isAdmin && !isEnrolled) {
//       console.log("🚫 Access denied for user:", userId);
//       return res.status(403).json({
//         success: false,
//         error: "Access denied. You are not enrolled in this course.",
//         details: "You need to be enrolled in the course, be the teacher, an admin, or the lesson must be marked as preview"
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
//     } else if (lesson.content_type === 'text') {
//       console.log("📝 Handling text preview");
//       await handleTextPreview(lesson, isPreviewLesson, res);
//     } else {
//       console.log("❓ Unknown content type:", lesson.content_type);
//       return res.status(400).json({
//         success: false,
//         error: `Unsupported content type: ${lesson.content_type}`
//       });
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
//           background: #f5f5f5;
//           min-height: 100vh;
//         }
//         .preview-container {
//           background: white;
//           border-radius: 10px;
//           padding: 30px;
//           box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//         }
//         .header { 
//           border-bottom: 2px solid #007bff; 
//           padding-bottom: 15px; 
//           margin-bottom: 20px; 
//           text-align: center;
//         }
//         .header h1 {
//           color: #333;
//           margin: 0;
//           font-size: 2em;
//         }
//         .content { 
//           white-space: pre-wrap;
//           background: #f8f9fa;
//           padding: 20px;
//           border-radius: 5px;
//           border-left: 4px solid #007bff;
//           font-size: 1em;
//           color: #333;
//         }
//         .info {
//           background: #e7f3ff;
//           padding: 15px;
//           border-radius: 5px;
//           margin-bottom: 20px;
//           border-left: 4px solid #007bff;
//         }
//         .info p {
//           margin: 5px 0;
//           color: #0056b3;
//           font-weight: 500;
//         }
//         .watermark {
//           text-align: center;
//           margin-top: 30px;
//           color: #666;
//           font-style: italic;
//           border-top: 1px solid #ddd;
//           padding-top: 15px;
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
//           Lesson Preview - Math Class Platform
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
  
//   res.setHeader('Content-Type', 'text/html; charset=utf-8');
//   res.send(htmlContent);
// }

// /**
//  * UNIVERSAL FILE SERVING ROUTE
//  * This handles ALL file requests from /Uploads/ path
//  */
// const serveFile = async (req, res) => {
//   try {
//     const { filename } = req.params;
    
//     // Security - prevent directory traversal attacks
//     const safeFilename = path.basename(filename);
//     const filePath = path.join(uploadsDir, safeFilename);

//     console.log("📁 Serving file:", { 
//       requested: filename, 
//       safeFilename, 
//       filePath
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
//         path: filePath
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
//       '.zip': 'application/zip'
//     };

//     const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
//     console.log("📄 File details:", {
//       filename: safeFilename,
//       size: stats.size,
//       mimeType: mimeType
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

// // Register file serving routes
// router.get("/Uploads/:filename", serveFile);
// router.get("/uploads/:filename", serveFile);

// // Export router
// export default router;



// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// UPLOADS DIRECTORY PATH
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
 * SIMPLIFIED PREVIEW ENDPOINT
 * GET /api/v1/files/preview-lesson/:lessonId
 * Returns lesson data for frontend to handle preview
 */
router.get("/preview-lesson/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    console.log("🔍 PREVIEW DATA REQUEST:", { 
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
      include: [
        {
          model: db.default.Course,
          as: "course",
          attributes: ['id', 'title', 'teacher_id']
        },
        {
          model: db.default.Unit,
          as: "unit",
          attributes: ['id', 'title']
        }
      ],
      attributes: [
        "id", "title", "file_url", "video_url", "content_type", 
        "content", "is_preview", "course_id", "unit_id"
      ]
    });

    if (!lesson) {
      console.log("❌ Lesson not found for preview:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    console.log("✅ Lesson found for preview:", lesson.title);

    // Check access permissions
    const isTeacher = lesson.course?.teacher_id === userId;
    const isPreviewLesson = lesson.is_preview;
    const isAdmin = req.user.role === "admin";
    const isEnrolled = await checkEnrollmentStatus(userId, lesson.course_id);

    // Allow access for: teachers, admins, enrolled students, or if lesson is marked as preview
    if (!isTeacher && !isPreviewLesson && !isAdmin && !isEnrolled) {
      console.log("🚫 Access denied for user:", userId);
      return res.status(403).json({
        success: false,
        error: "Access denied. You are not enrolled in this course."
      });
    }

    console.log("✅ Access granted for preview");

    // Build file URLs
    const lessonData = buildFileUrls(lesson.toJSON());
    
    // Return lesson data for frontend to handle preview
    res.json({
      success: true,
      lesson: lessonData,
      access: {
        canView: true,
        canDownload: isTeacher || isAdmin,
        previewType: isPreviewLesson ? 'free' : 'enrolled'
      }
    });
    
  } catch (error) {
    console.error("❌ PREVIEW ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to load lesson preview",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Helper function to check if user is enrolled in a course
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

/**
 * Build absolute file URLs
 */
function buildFileUrls(lesson) {
  if (!lesson) return null;
  
  const backend = process.env.BACKEND_URL || "http://localhost:5000";
  const data = { ...lesson };

  // Clean path helper
  const clean = (u) => (u && u.startsWith("/") ? u.slice(1) : u);

  // Build video URL
  if (data.video_url && !data.video_url.startsWith("http")) {
    const cleanVideoUrl = clean(data.video_url);
    data.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
  }

  // Build file URL
  if (data.file_url && !data.file_url.startsWith("http")) {
    const cleanFileUrl = clean(data.file_url);
    data.file_url = `${backend}/api/v1/files/${cleanFileUrl}`;
  }

  return data;
}

/**
 * UNIVERSAL FILE SERVING ROUTE
 * This handles ALL file requests from /Uploads/ path
 */
const serveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    console.log("📁 Serving file:", safeFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log("❌ File not found:", safeFilename);
      return res.status(404).json({
        success: false,
        error: `File not found: ${safeFilename}`
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
      '.zip': 'application/zip'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
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

// Register file serving routes
router.get("/Uploads/:filename", serveFile);
router.get("/uploads/:filename", serveFile);

// Export router
export default router;