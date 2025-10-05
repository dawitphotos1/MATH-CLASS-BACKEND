
// routes/courses.js
import express from "express";
import {
  createCourse,
  getCourses,
  getPublicCourseBySlug,
  getLessonsByCourse,
  deleteCourse,
  getCourseById, // ✅ NEW: Import the new function
} from "../controllers/courseController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";

const router = express.Router();

/* ========================================================
   🟢 PUBLIC ROUTES — accessible without login
======================================================== */

// View all courses (public)
router.get("/", getCourses);

// View a specific course by slug (public)
router.get("/:slug", getPublicCourseBySlug);

// ✅ NEW: Get course by ID (public) - FIXES THE ISSUE
router.get("/id/:id", getCourseById);

// View lessons by course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

/* ========================================================
   🔐 PROTECTED ROUTES — restricted to teachers/admins
======================================================== */

// Create a new course (requires teacher/admin)
router.post("/", authenticateToken, checkTeacherOrAdmin, createCourse);

// Delete a course (requires teacher/admin)
router.delete("/:id", authenticateToken, checkTeacherOrAdmin, deleteCourse);

export default router;