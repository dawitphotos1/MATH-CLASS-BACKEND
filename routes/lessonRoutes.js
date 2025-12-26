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
import * as lessonController from "../controllers/lessonController.js"; // CHANGED: import everything
import {
  uploadLessonFiles,
  processUploadedFiles,
} from "../middleware/cloudinaryUpload.js";
import { authenticateToken, requireTeacherOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// DEBUG ROUTE (First, to check what's available)
// ================================
router.get("/debug/available-functions", (req, res) => {
  const functions = Object.keys(lessonController);
  const availableFunctions = functions.filter(f => typeof lessonController[f] === 'function');
  
  res.json({
    success: true,
    message: "Debug: Available functions in lessonController",
    totalFunctions: functions.length,
    availableFunctions,
    hasGetPublicPreviewByLessonId: typeof lessonController.getPublicPreviewByLessonId === 'function',
    hasGetPreviewLessonForCourse: typeof lessonController.getPreviewLessonForCourse === 'function',
    hasGetLessonById: typeof lessonController.getLessonById === 'function',
    // Check both named and default export
    defaultExport: typeof lessonController.default === 'object' ? 'Yes' : 'No',
    defaultExportFunctions: lessonController.default ? Object.keys(lessonController.default) : [],
  });
});

// ================================
// PUBLIC ROUTES
// ================================

// Get lesson by ID
router.get("/:id", lessonController.getLessonById);

// Get public preview by lesson ID - IMPORTANT: Check if function exists
router.get("/public-preview/:lessonId", (req, res) => {
  // Check if function exists
  if (typeof lessonController.getPublicPreviewByLessonId === 'function') {
    return lessonController.getPublicPreviewByLessonId(req, res);
  } else if (lessonController.default && typeof lessonController.default.getPublicPreviewByLessonId === 'function') {
    return lessonController.default.getPublicPreviewByLessonId(req, res);
  } else {
    // Fallback to getLessonById if function doesn't exist
    console.warn("⚠️ getPublicPreviewByLessonId not found, using getLessonById as fallback");
    return lessonController.getLessonById(req, res);
  }
});

// Get preview lesson for course
router.get("/preview/course/:courseId", (req, res) => {
  if (typeof lessonController.getPreviewLessonForCourse === 'function') {
    return lessonController.getPreviewLessonForCourse(req, res);
  } else if (lessonController.default && typeof lessonController.default.getPreviewLessonForCourse === 'function') {
    return lessonController.default.getPreviewLessonForCourse(req, res);
  } else {
    return res.status(500).json({
      success: false,
      error: "Function getPreviewLessonForCourse not available"
    });
  }
});

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
      
      if (typeof lessonController.createLesson === 'function') {
        return await lessonController.createLesson(req, res);
      } else if (lessonController.default && typeof lessonController.default.createLesson === 'function') {
        return await lessonController.default.createLesson(req, res);
      } else {
        return res.status(500).json({
          success: false,
          error: "Function createLesson not available"
        });
      }
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
      
      if (typeof lessonController.updateLesson === 'function') {
        return await lessonController.updateLesson(req, res);
      } else if (lessonController.default && typeof lessonController.default.updateLesson === 'function') {
        return await lessonController.default.updateLesson(req, res);
      } else {
        return res.status(500).json({
          success: false,
          error: "Function updateLesson not available"
        });
      }
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
  (req, res) => {
    if (typeof lessonController.deleteLessonFile === 'function') {
      return lessonController.deleteLessonFile(req, res);
    } else if (lessonController.default && typeof lessonController.default.deleteLessonFile === 'function') {
      return lessonController.default.deleteLessonFile(req, res);
    } else {
      return res.status(500).json({
        success: false,
        error: "Function deleteLessonFile not available"
      });
    }
  }
);

// ================================
// SIMPLE TEST ROUTE
// ================================
router.get("/test/simple", (req, res) => {
  res.json({
    success: true,
    message: "Lesson routes are working!",
    timestamp: new Date().toISOString(),
    routes: {
      publicPreview: "GET /api/v1/lessons/public-preview/:lessonId",
      lessonById: "GET /api/v1/lessons/:id",
      previewForCourse: "GET /api/v1/lessons/preview/course/:courseId",
    }
  });
});

export default router;