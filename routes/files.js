
// // routes/files.js
// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import { authenticateToken } from "../middleware/authMiddleware.js";
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
//  * SIMPLIFIED PREVIEW ENDPOINT
//  * GET /api/v1/files/preview-lesson/:lessonId
//  * Returns lesson data for frontend to handle preview
//  */
// router.get("/preview-lesson/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;
    
//     console.log("🔍 PREVIEW DATA REQUEST:", { 
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
//       include: [
//         {
//           model: db.default.Course,
//           as: "course",
//           attributes: ['id', 'title', 'teacher_id']
//         },
//         {
//           model: db.default.Unit,
//           as: "unit",
//           attributes: ['id', 'title']
//         }
//       ],
//       attributes: [
//         "id", "title", "file_url", "video_url", "content_type", 
//         "content", "is_preview", "course_id", "unit_id"
//       ]
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found for preview:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found"
//       });
//     }

//     console.log("✅ Lesson found for preview:", lesson.title);

//     // Check access permissions
//     const isTeacher = lesson.course?.teacher_id === userId;
//     const isPreviewLesson = lesson.is_preview;
//     const isAdmin = req.user.role === "admin";
//     const isEnrolled = await checkEnrollmentStatus(userId, lesson.course_id);

//     // Allow access for: teachers, admins, enrolled students, or if lesson is marked as preview
//     if (!isTeacher && !isPreviewLesson && !isAdmin && !isEnrolled) {
//       console.log("🚫 Access denied for user:", userId);
//       return res.status(403).json({
//         success: false,
//         error: "Access denied. You are not enrolled in this course."
//       });
//     }

//     console.log("✅ Access granted for preview");

//     // Build file URLs
//     const lessonData = buildFileUrls(lesson.toJSON());
    
//     // Return lesson data for frontend to handle preview
//     res.json({
//       success: true,
//       lesson: lessonData,
//       access: {
//         canView: true,
//         canDownload: isTeacher || isAdmin,
//         previewType: isPreviewLesson ? 'free' : 'enrolled'
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ PREVIEW ERROR:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load lesson preview",
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

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
//  * Build absolute file URLs
//  */
// function buildFileUrls(lesson) {
//   if (!lesson) return null;
  
//   const backend = process.env.BACKEND_URL || "http://localhost:5000";
//   const data = { ...lesson };

//   // Clean path helper
//   const clean = (u) => (u && u.startsWith("/") ? u.slice(1) : u);

//   // Build video URL
//   if (data.video_url && !data.video_url.startsWith("http")) {
//     const cleanVideoUrl = clean(data.video_url);
//     data.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
//   }

//   // Build file URL
//   if (data.file_url && !data.file_url.startsWith("http")) {
//     const cleanFileUrl = clean(data.file_url);
//     data.file_url = `${backend}/api/v1/files/${cleanFileUrl}`;
//   }

//   return data;
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

//     console.log("📁 Serving file:", safeFilename);

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//     } catch (error) {
//       console.log("❌ File not found:", safeFilename);
//       return res.status(404).json({
//         success: false,
//         error: `File not found: ${safeFilename}`
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
    await fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Created Uploads directory");
  }
};

// Initialize directory on server start
ensureUploadsDir();

/**
 * DEBUG ENDPOINT - Check file existence and paths
 * GET /api/v1/files/debug-file/:filename
 */
router.get("/debug-file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    console.log("🔍 DEBUG FILE CHECK:", {
      requested: filename,
      safeFilename,
      filePath,
      uploadsDir
    });

    // Check if file exists
    let fileExists = false;
    let fileStats = null;
    
    try {
      await fs.access(filePath);
      fileExists = true;
      fileStats = await fs.stat(filePath);
      console.log("✅ File exists:", fileStats);
    } catch (error) {
      console.log("❌ File does not exist:", error.message);
    }

    // List all files in uploads directory
    let allFiles = [];
    try {
      allFiles = await fs.readdir(uploadsDir);
      console.log("📁 All files in uploads:", allFiles);
    } catch (error) {
      console.log("❌ Cannot read uploads directory:", error.message);
    }

    res.json({
      success: true,
      debug: {
        requestedFile: filename,
        safeFilename,
        filePath,
        fileExists,
        fileSize: fileStats?.size || 0,
        uploadsDir,
        totalFiles: allFiles.length,
        allFiles: allFiles.slice(0, 20), // First 20 files
        matchingFiles: allFiles.filter(f => f.includes(safeFilename))
      }
    });

  } catch (error) {
    console.error("❌ DEBUG ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
 * ENHANCED UNIVERSAL FILE SERVING ROUTE
 * Handles ALL file requests with better Windows path support and error handling
 */
const serveFile = async (req, res) => {
  let fileStream = null;
  
  try {
    const { filename } = req.params;
    
    console.log("📁 FILE SERVING REQUEST:", filename);

    // Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    let filePath = path.join(uploadsDir, safeFilename);

    // Normalize path for Windows
    filePath = path.normalize(filePath);

    console.log("🔍 Looking for file at:", filePath);

    // Check if file exists
    let fileExists = false;
    let finalFilePath = filePath;

    try {
      await fs.access(filePath);
      fileExists = true;
      finalFilePath = filePath;
      console.log("✅ File exists:", filePath);
    } catch (error) {
      console.log("❌ File not found at primary path:", filePath);
      
      // Try alternative paths
      const possiblePaths = [
        path.join(uploadsDir, filename),
        path.join(process.cwd(), 'Uploads', safeFilename),
        path.join(process.cwd(), 'Uploads', filename),
        path.join(__dirname, '..', 'Uploads', safeFilename),
        path.join(__dirname, '..', 'Uploads', filename)
      ].map(p => path.normalize(p));

      for (const testPath of possiblePaths) {
        try {
          await fs.access(testPath);
          fileExists = true;
          finalFilePath = testPath;
          console.log("✅ File found at alternative path:", testPath);
          break;
        } catch (e) {
          // Continue to next path
        }
      }
    }

    if (!fileExists) {
      console.log("❌ File not found in any location:", safeFilename);
      return res.status(404).json({
        success: false,
        error: `File not found: ${safeFilename}`
      });
    }

    // Get file stats
    const stats = await fs.stat(finalFilePath);
    
    console.log("📄 File stats:", {
      filename: safeFilename,
      path: finalFilePath,
      size: stats.size,
      canRead: true
    });

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
    
    console.log("🚀 Serving file with headers...");
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // For PDFs, always allow inline display
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      console.log("📖 PDF inline display enabled");
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    }
    
    // Create read stream and pipe to response
    fileStream = fs.createReadStream(finalFilePath);
    
    fileStream.on('error', (error) => {
      console.error("❌ FILE STREAM ERROR:", error);
      console.error("Error details:", {
        code: error.code,
        path: finalFilePath,
        message: error.message
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error reading file stream",
          details: error.message
        });
      }
    });

    fileStream.on('open', () => {
      console.log("✅ File stream opened successfully");
    });

    fileStream.on('close', () => {
      console.log("✅ File stream closed successfully");
    });

    // Pipe the file to response
    fileStream.pipe(res);
    
    console.log("✅ File streaming started");

  } catch (error) {
    console.error("❌ FILE SERVING ERROR:", error);
    console.error("Full error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
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