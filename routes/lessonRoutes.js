
// routes/lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson,
  debugGetLesson,
  debugCheckFile,
} from "../controllers/lessonController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ FIXED: Enhanced lesson routes with better error handling
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);

router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);
router.get("/:lessonId", authenticateToken, getLessonById);

router.put(
  "/:lessonId",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  updateLesson
);

router.delete(
  "/:lessonId",
  authenticateToken,
  checkTeacherOrAdmin,
  deleteLesson
);

// ✅ DEBUG ROUTES - Add these new routes

// Debug: Get lesson directly from database
router.get("/debug/:lessonId", authenticateToken, debugGetLesson);

// Debug: Check if file exists on server
router.get("/debug/file/:filename", authenticateToken, debugCheckFile);

// Debug: List all lessons in a course (for debugging)
router.get("/debug/course/:courseId/lessons", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("🐛 DEBUG: Fetching all lessons for course:", courseId);

    const lessons = await getLessonsByCourse({
      params: { courseId },
      user: req.user
    }, res);

    // This will use the existing getLessonsByCourse function
    // The response will be handled by that function
  } catch (error) {
    console.error("🐛 DEBUG Course lessons error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route to test connectivity and file handling (existing route - keep it)
router.get("/debug/test/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🔧 Debug test route called for lesson:", lessonId);

    const db = await import("../models/index.js");
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      include: [{
        model: db.default.Course,
        as: "course",
        attributes: ["id", "title", "teacher_id"]
      }],
      attributes: ["id", "title", "file_url", "video_url", "content_type", "course_id", "unit_id"]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson ${lessonId} not found in database`
      });
    }

    // Build full URLs for debug
    const lessonData = lesson.toJSON();
    if (lessonData.file_url && !lessonData.file_url.startsWith('http')) {
      lessonData.file_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.file_url}`;
    }
    if (lessonData.video_url && !lessonData.video_url.startsWith('http')) {
      lessonData.video_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.video_url}`;
    }

    res.json({
      success: true,
      lesson: {
        id: lessonData.id,
        title: lessonData.title,
        file_url: lessonData.file_url,
        video_url: lessonData.video_url,
        content_type: lessonData.content_type,
        course_id: lessonData.course_id,
        course_teacher_id: lessonData.course?.teacher_id,
        unit_id: lessonData.unit_id
      },
      backend_url: process.env.BACKEND_URL,
      file_exists: lessonData.file_url ? true : false
    });
  } catch (error) {
    console.error("❌ Debug test route error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      backend_url: process.env.BACKEND_URL
    });
  }
});

export default router;