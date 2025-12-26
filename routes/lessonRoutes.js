// // routes/lessonRoutes.js - UPDATED
// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// import {
//   uploadLessonFiles,
//   processUploadedFiles,
// } from "../middleware/cloudinaryUpload.js";
// import { authenticateToken, requireTeacherOrAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ================================
// // PUBLIC ROUTES
// // ================================

// // Get lesson by ID
// router.get("/:id", lessonController.getLessonById);

// // Get preview lesson for course
// router.get("/preview/course/:courseId", lessonController.getPreviewLessonForCourse);

// // ================================
// // PROTECTED ROUTES
// // ================================

// // Create lesson with multiple files
// router.post(
//   "/course/:courseId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadLessonFiles,
//   async (req, res) => {
//     try {
//       console.log("📤 Processing file upload...");
//       await processUploadedFiles(req);
//       return await lessonController.createLesson(req, res);
//     } catch (error) {
//       console.error("❌ Route error:", error);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to process upload",
//       });
//     }
//   }
// );

// // Update lesson with multiple files
// router.put(
//   "/:lessonId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadLessonFiles,
//   async (req, res) => {
//     try {
//       console.log("📤 Processing file update...");
//       await processUploadedFiles(req);
//       return await lessonController.updateLesson(req, res);
//     } catch (error) {
//       console.error("❌ Route error:", error);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to process upload",
//       });
//     }
//   }
// );

// // Delete specific file from lesson
// router.delete(
//   "/:lessonId/files/:fileType/:fileIndex",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   lessonController.deleteLessonFile
// );

// // Test endpoint
// router.get("/test/multi-upload", (req, res) => {
//   res.json({
//     success: true,
//     message: "Multi-upload endpoints are ready",
//     endpoints: {
//       create: "POST /api/v1/lessons/course/:courseId",
//       update: "PUT /api/v1/lessons/:lessonId",
//       deleteFile: "DELETE /api/v1/lessons/:lessonId/files/:fileType/:fileIndex",
//       preview: "GET /api/v1/lessons/preview/course/:courseId",
//     },
//   });
// });

// export default router;





// routes/lessonRoutes.js - COMPLETE FIXED VERSION
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

// Get public preview by lesson ID (FIXED: Added this missing route)
router.get("/public-preview/:lessonId", lessonController.getPublicPreviewByLessonId);

// Get preview lesson for course
router.get("/preview/course/:courseId", lessonController.getPreviewLessonForCourse);

// Get all lessons for a course (alternative route for frontend compatibility)
router.get("/course/:courseId/all", async (req, res) => {
  try {
    const { courseId } = req.params;
    const db = await import("../models/index.js").then(m => m.default);
    
    const lessons = await db.Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [
        {
          model: db.Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_name", "file_type"],
        },
      ],
    });
    
    res.json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("Error fetching all lessons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
});

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

// Check course preview status
router.get(
  "/preview/status/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  lessonController.checkCoursePreviewStatus
);

// Mark/unmark lesson as preview
router.put(
  "/:lessonId/mark-preview",
  authenticateToken,
  requireTeacherOrAdmin,
  lessonController.markLessonAsPreview
);

// ================================
// TEST & DEBUG ENDPOINTS
// ================================

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
      publicPreview: "GET /api/v1/lessons/public-preview/:lessonId",
    },
  });
});

// Debug: Get all functions from lessonController
router.get("/debug/controller", (req, res) => {
  const functions = Object.keys(lessonController).filter(key => typeof lessonController[key] === 'function');
  res.json({
    success: true,
    functions,
    controller: "lessonController",
  });
});

export default router;