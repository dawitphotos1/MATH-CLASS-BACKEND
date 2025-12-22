// routes/courses.js - CORRECTED VERSION
import express from "express";
import {
  createCourse,
  getCourses,
  getPublicCourseBySlug,
  getLessonsByCourse,
  deleteCourse,
  getCourseById,
  createCourseWithUnits,
  getTeacherCourses,
  getTeacherCourseFull,
  updateCourse  // Make sure this is imported
} from "../controllers/courseController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { isTeacher } from "../middleware/authMiddleware.js";
import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
import { getPreviewLessonForCourse } from "../controllers/lessonController.js";

const router = express.Router();

/* ========================================================
   🟢 PUBLIC ROUTES — accessible without login
======================================================== */

// Get all courses (public)
router.get("/", getCourses);

// Get course by ID (public) - MUST come BEFORE slug route
router.get("/id/:id", getCourseById);

// Get all lessons for a course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

// PUBLIC: Get first preview lesson for a course
router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

/* ========================================================
   🔐 PROTECTED ROUTES — teachers / admins only
======================================================== */

// Create new course
router.post(
  "/",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

router.post(
  "/create",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

router.post(
  "/create-with-units",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourseWithUnits
);

// Delete course
router.delete("/:id", authenticateToken, deleteCourse);

// Update course (ADD THIS ROUTE)
router.patch("/:id", authenticateToken, updateCourse);

// Get course by ID for editing (PROTECTED version)
router.get("/edit/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Call the existing getCourseById function
    const courseResponse = await getCourseById({ params: { id } }, res, true);
    
    if (!courseResponse) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check authorization
    if (userRole !== "admin" && courseResponse.teacher_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this course",
      });
    }

    res.json({
      success: true,
      course: courseResponse,
    });
  } catch (error) {
    console.error("Error fetching course for editing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course for editing",
    });
  }
});

/* ============================================================
   👨🏫 TEACHER DASHBOARD ROUTES
============================================================ */

router.get(
  "/teacher/my-courses-detailed",
  authenticateToken,
  isTeacher,
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const courses = await Course.findAll({
        where: { teacher_id: teacherId },
        attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
        include: [
          {
            model: Unit,
            as: "units",
            attributes: ["id", "title", "description", "order_index"],
            include: [
              {
                model: Lesson,
                as: "lessons",
                attributes: [
                  "id",
                  "title",
                  "content",
                  "video_url",
                  "file_url",
                  "order_index",
                  "content_type",
                  "is_preview",
                  "created_at",
                ],
                order: [["order_index", "ASC"]],
              },
            ],
            order: [["order_index", "ASC"]],
          },
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.json({ success: true, courses });
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      res.status(500).json({ success: false, error: "Failed to fetch courses" });
    }
  }
);

router.get("/teacher/my-courses", authenticateToken, isTeacher, getTeacherCourses);

// Teacher course full details
router.get(
  "/teacher/:courseId/full",
  authenticateToken,
  isTeacher,
  getTeacherCourseFull
);

// ⚠ Slug route MUST be last because it catches all dynamic paths
router.get("/slug/:slug", getPublicCourseBySlug); // Changed from "/:slug" to "/slug/:slug"

export default router;