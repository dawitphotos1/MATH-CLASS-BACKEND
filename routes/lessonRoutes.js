// // routes/lessonRoutes.js - CLEANED & UPDATED VERSION
// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// // Import ALL exports from cloudinaryUpload
// import upload, {
//   uploadLessonFiles,
//   processUploadedFiles,
//   singleUpload,
// } from "../middleware/cloudinaryUpload.js";
// import db from "../models/index.js";
// import { authenticateToken, requireTeacherOrAdmin } from "../middleware/authMiddleware.js";

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

// // Create lesson (teacher/admin only)
// router.post(
//   "/course/:courseId/lessons",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadLessonFiles,
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

// // Update lesson (teacher/admin only)
// router.put(
//   "/:lessonId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadLessonFiles,
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

// // Get lesson by ID (public)
// router.get("/:id", lessonController.getLessonById);

// // Preview endpoints (public)
// router.get(
//   "/preview/course/:courseId",
//   lessonController.getPreviewLessonForCourse
// );
// router.get(
//   "/public-preview/:lessonId",
//   lessonController.getPublicPreviewByLessonId
// );

// // Lessons by course / unit (public)
// router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
// router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// // Delete lesson (teacher/admin only)
// router.delete(
//   "/:lessonId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   lessonController.deleteLesson
// );

// // ======================================================
// // ADMIN UTILITY ROUTES FOR FIXING PDF URLs
// // ======================================================

// // ✅ FIX ALL Cloudinary URLs in database (POST method)
// router.post(
//   "/fix-all-cloudinary-urls",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   lessonController.fixAllCloudinaryUrls
// );

// // ✅ Fix specific lesson URL
// router.post(
//   "/fix/:lessonId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   lessonController.fixLessonFileUrl
// );

// // ======================================================
// // DEBUG & TESTING ROUTES
// // ======================================================

// // Test file access
// router.get("/debug/test-file", lessonController.testFileAccess);

// // Debug lesson file
// router.get("/debug/:lessonId/file", lessonController.debugLessonFile);

// // Simple debug endpoint
// router.get("/debug/file", (req, res) => {
//   res.json({
//     success: true,
//     message: "File debug endpoint",
//     query: req.query,
//   });
// });

// // Simple test upload endpoint
// router.post(
//   "/test/file-upload",
//   authenticateToken,
//   singleUpload,
//   async (req, res) => {
//     try {
//       console.log("🧪 Test upload received file:", req.file?.originalname);

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "No file uploaded",
//         });
//       }

//       // Process the file
//       const result = await processUploadedFiles({
//         files: { file: [req.file] },
//       });

//       return res.json({
//         success: true,
//         message: "Test upload successful",
//         file: {
//           name: req.file.originalname,
//           size: req.file.size,
//           type: req.file.mimetype,
//         },
//         uploadResult: result,
//       });
//     } catch (error) {
//       console.error("❌ Test upload error:", error);
//       return res.status(500).json({
//         success: false,
//         error: "Test upload failed",
//         details: error.message,
//       });
//     }
//   }
// );

// export default router;





// routes/lessonRoutes.js - UPDATED
import express from "express";
import lessonController from "../controllers/lessonController.js";
import {
  uploadLessonFiles,
  processUploadedFiles,
} from "../middleware/cloudinaryUpload.js";
import { authenticateToken, requireTeacherOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// PUBLIC ROUTES
// ================================

// Get lesson by ID
router.get("/:id", lessonController.getLessonById);

// Get preview lesson for course
router.get("/preview/course/:courseId", lessonController.getPreviewLessonForCourse);

// ================================
// PROTECTED ROUTES
// ================================

// Create lesson with multiple files
router.post(
  "/course/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadLessonFiles,
  async (req, res) => {
    try {
      console.log("📤 Processing file upload...");
      await processUploadedFiles(req);
      return await lessonController.createLesson(req, res);
    } catch (error) {
      console.error("❌ Route error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process upload",
      });
    }
  }
);

// Update lesson with multiple files
router.put(
  "/:lessonId",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadLessonFiles,
  async (req, res) => {
    try {
      console.log("📤 Processing file update...");
      await processUploadedFiles(req);
      return await lessonController.updateLesson(req, res);
    } catch (error) {
      console.error("❌ Route error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process upload",
      });
    }
  }
);

// Delete specific file from lesson
router.delete(
  "/:lessonId/files/:fileType/:fileIndex",
  authenticateToken,
  requireTeacherOrAdmin,
  lessonController.deleteLessonFile
);

// Test endpoint
router.get("/test/multi-upload", (req, res) => {
  res.json({
    success: true,
    message: "Multi-upload endpoints are ready",
    endpoints: {
      create: "POST /api/v1/lessons/course/:courseId",
      update: "PUT /api/v1/lessons/:lessonId",
      deleteFile: "DELETE /api/v1/lessons/:lessonId/files/:fileType/:fileIndex",
      preview: "GET /api/v1/lessons/preview/course/:courseId",
    },
  });
});

export default router;