// routes/lessonRoutes.js

import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

// ✅ CORRECT IMPORTS - using default export for checkTeacherOrAdmin
import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js"; // Default import
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Lesson routes
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  upload,
  createLesson
);
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);
router.get("/lessons/:lessonId", authenticateToken, getLessonById);
router.put(
  "/lessons/:lessonId",
  authenticateToken,
  checkTeacherOrAdmin,
  upload,
  updateLesson
);
router.delete(
  "/lessons/:lessonId",
  authenticateToken,
  checkTeacherOrAdmin,
  deleteLesson
);

export default router;