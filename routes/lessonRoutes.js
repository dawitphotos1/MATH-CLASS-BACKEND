
// routes/lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import { authenticateToken, isTeacher, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teachers/admins can create lessons
router.post("/", authenticateToken, isTeacher, createLesson);

// Get lessons for a course
router.get("/course/:courseId", authenticateToken, getLessonsByCourse);

// Get a single lesson
router.get("/:lessonId", authenticateToken, getLessonById);

// Update lesson
router.put("/:lessonId", authenticateToken, isTeacher, updateLesson);

// Delete lesson
router.delete("/:lessonId", authenticateToken, isTeacher, deleteLesson);

export default router;
