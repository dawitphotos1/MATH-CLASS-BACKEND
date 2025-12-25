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