// // routes/lessonRoutes.js
// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// // Import ALL exports from cloudinaryUpload
// import upload, {
//   uploadLessonFiles,
//   processUploadedFiles,
//   singleUpload,
// } from "../middleware/cloudinaryUpload.js";
// import db from "../models/index.js";

// const { Lesson } = db;

// const router = express.Router();

// /* ---------------------------------------------------------------
//    SIMPLIFIED & WORKING ROUTES
// ---------------------------------------------------------------- */

// // Test endpoint
// router.get("/test-route", (req, res) => {
//   res.json({
//     success: true,
//     message: "Lesson routes are working",
//     timestamp: new Date().toISOString(),
//     cloudinary: upload.USE_CLOUDINARY ? "ENABLED" : "DISABLED",
//   });
// });

// // Create lesson
// router.post(
//   "/course/:courseId/lessons",
//   uploadLessonFiles, // Use the named export directly
//   async (req, res) => {
//     try {
//       console.log("📝 Creating lesson for course:", req.params.courseId);

//       // Process uploaded files
//       if (req.files && Object.keys(req.files).length > 0) {
//         console.log("📤 Files received:", Object.keys(req.files));
//         await processUploadedFiles(req);
//       }

//       // Call the controller
//       return await lessonController.createLesson(req, res);
//     } catch (error) {
//       console.error("❌ Create lesson error in route:", error);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to create lesson",
//         details:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       });
//     }
//   }
// );

// // Update lesson
// router.put(
//   "/:lessonId",
//   uploadLessonFiles, // Use the named export directly
//   async (req, res) => {
//     try {
//       console.log("📝 Updating lesson:", req.params.lessonId);

//       // Process uploaded files
//       if (req.files && Object.keys(req.files).length > 0) {
//         console.log("📤 Files received:", Object.keys(req.files));
//         await processUploadedFiles(req);
//       }

//       // Call the controller
//       return await lessonController.updateLesson(req, res);
//     } catch (error) {
//       console.error("❌ Update lesson error in route:", error);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to update lesson",
//         details:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       });
//     }
//   }
// );

// // Get lesson by ID
// router.get("/:id", lessonController.getLessonById);

// // Preview endpoints
// router.get(
//   "/preview/course/:courseId",
//   lessonController.getPreviewLessonForCourse
// );
// router.get(
//   "/public-preview/:lessonId",
//   lessonController.getPublicPreviewByLessonId
// );

// // Lessons by course / unit
// router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
// router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// // Delete lesson
// router.delete("/:lessonId", lessonController.deleteLesson);

// // Debug endpoints
// router.get("/debug/:lessonId/file", (req, res) => {
//   res.json({
//     success: true,
//     message: "Debug endpoint",
//     lessonId: req.params.lessonId,
//   });
// });

// router.get("/debug/file", (req, res) => {
//   res.json({
//     success: true,
//     message: "File debug endpoint",
//     query: req.query,
//   });
// });

// // 🔥 NEW: Debug endpoint to test file access
// router.get("/debug/test-file", lessonController.testFileAccess);

// // In routes/lessonRoutes.js, add this route:
// router.get("/debug/fix-all-cloudinary", lessonController.fixAllCloudinaryUrls);

// // 🔥 NEW: Debug endpoint to check and fix a specific lesson
// router.get("/debug/fix/:lessonId", async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
    
//     if (!lesson) {
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }
    
//     // Import the fixCloudinaryUrl helper
//     const fixCloudinaryUrl = (url) => {
//       if (!url) return url;
      
//       if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
//         if (url.includes('.pdf') || url.includes('/mathe-class/pdfs/')) {
//           return url.replace('/image/upload/', '/raw/upload/');
//         } else if (url.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|$)/i)) {
//           return url.replace('/image/upload/', '/raw/upload/');
//         }
//       }
//       return url;
//     };
    
//     const oldUrl = lesson.file_url;
//     let newUrl = fixCloudinaryUrl(oldUrl);
    
//     // Update if changed
//     let updated = false;
//     if (newUrl !== oldUrl) {
//       await lesson.update({ file_url: newUrl });
//       updated = true;
//     }
    
//     // Also fix video URLs if needed
//     let videoUpdated = false;
//     if (lesson.video_url && lesson.video_url.includes('cloudinary.com/image/upload/')) {
//       const oldVideoUrl = lesson.video_url;
//       const newVideoUrl = oldVideoUrl.replace('/image/upload/', '/video/upload/');
//       if (newVideoUrl !== oldVideoUrl) {
//         await lesson.update({ video_url: newVideoUrl });
//         videoUpdated = true;
//       }
//     }
    
//     res.json({
//       success: true,
//       lessonId: lesson.id,
//       title: lesson.title,
//       file_url: {
//         old: oldUrl,
//         new: newUrl,
//         updated
//       },
//       video_url: {
//         old: lesson.video_url,
//         updated: videoUpdated
//       },
//       previewUrl: lessonController.buildFileUrls(lesson).fileUrl,
//       message: updated ? "URL fixed successfully" : "No fix needed"
//     });
    
//   } catch (error) {
//     console.error("Debug error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Simple test upload endpoint
// router.post("/test/file-upload", singleUpload, async (req, res) => {
//   try {
//     console.log("🧪 Test upload received file:", req.file?.originalname);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "No file uploaded",
//       });
//     }

//     // Process the file
//     const result = await processUploadedFiles({
//       files: { file: [req.file] },
//     });

//     return res.json({
//       success: true,
//       message: "Test upload successful",
//       file: {
//         name: req.file.originalname,
//         size: req.file.size,
//         type: req.file.mimetype,
//       },
//       uploadResult: result,
//     });
//   } catch (error) {
//     console.error("❌ Test upload error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Test upload failed",
//       details: error.message,
//     });
//   }
// });

// export default router;







// routes/lessonRoutes.js
import express from "express";
import {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByUnit,
  getLessonsByCourse,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  debugLessonFile,
  fixLessonFileUrl,
  testFileAccess,
  fixAllCloudinaryUrls,
} from "../controllers/lessonController.js";

import {
  uploadLessonFiles,
  processUploadedFiles,
} from "../middleware/cloudinaryUpload.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------------
   LESSON CRUD
------------------------- */

// Create lesson
router.post(
  "/course/:courseId",
  authMiddleware,
  uploadLessonFiles,
  async (req, res, next) => {
    await processUploadedFiles(req);
    next();
  },
  createLesson
);

// Update lesson
router.put(
  "/:lessonId",
  authMiddleware,
  uploadLessonFiles,
  async (req, res, next) => {
    await processUploadedFiles(req);
    next();
  },
  updateLesson
);

// Delete lesson
router.delete("/:lessonId", authMiddleware, deleteLesson);

// Get lesson by ID
router.get("/:id", getLessonById);

/* -------------------------
   LISTING
------------------------- */

// Lessons by unit
router.get("/unit/:unitId", getLessonsByUnit);

// Lessons by course
router.get("/course/:courseId", getLessonsByCourse);

/* -------------------------
   PREVIEW
------------------------- */

// Course preview (Free Preview button)
router.get("/course/:courseId/preview", getPreviewLessonForCourse);

// Public preview by lesson ID
router.get("/public/:lessonId", getPublicPreviewByLessonId);

/* -------------------------
   DEBUG & FIX TOOLS
   (SAFE TO KEEP)
------------------------- */

// Debug lesson file
router.get("/debug/file", debugLessonFile);

// Fix single lesson file URL
router.post("/fix/file/:lessonId", fixLessonFileUrl);

// Fix all Cloudinary URLs
router.post("/fix/all", fixAllCloudinaryUrls);

// Test file access
router.get("/test/file", testFileAccess);

export default router;
