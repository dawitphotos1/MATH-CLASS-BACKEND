// routes/courses.js - COMPLETE FIXED VERSION
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
  updateCourse,
  checkCourseExists,
  debugEnhancedPreview, // ADD THIS
} from "../controllers/courseController.js";

import {
  authenticateToken,
  requireTeacherOrAdmin,
  requireTeacher,
  requireOwnership,
} from "../middleware/authMiddleware.js";

import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
import {
  getPreviewLessonForCourse,
  checkCoursePreviewStatus,
  markLessonAsPreview,
} from "../controllers/lessonController.js";

import db from "../models/index.js";
const { Course, User, Unit, Lesson } = db;

const router = express.Router();

// =========================================================
// PUBLIC ROUTES (No Authentication)
// =========================================================

// Get all courses (public)
router.get("/", getCourses);

// Get course by ID (public)
router.get("/id/:id", getCourseById);

// Get all lessons for a course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

// Get units for a course (public)
router.get("/:courseId/units", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🔍 Fetching units for course: ${courseId}`);
    
    // Check if Unit model exists
    if (!Unit) {
      return res.json({
        success: true,
        units: [],
        message: "Units feature not available",
      });
    }
    
    // Get units with their lessons
    const units = await Unit.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "order_index", "content_type", "is_preview"],
          order: [["order_index", "ASC"]],
        },
      ],
    });
    
    console.log(`✅ Found ${units.length} units for course ${courseId}`);
    
    res.json({
      success: true,
      units: units || [],
    });
  } catch (error) {
    console.error("❌ Error fetching units:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch units",
    });
  }
});

// Get preview lesson for a course (public) - FIXED ROUTE
router.get("/:courseId/preview-lesson", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🔍 Getting preview lesson for course: ${courseId}`);
    
    // Call the preview function from lessonController
    const previewReq = { params: { courseId } };
    const previewRes = {
      json: (data) => res.json(data),
      status: (code) => ({ json: (data) => res.status(code).json(data) })
    };
    
    await getPreviewLessonForCourse(previewReq, previewRes);
  } catch (error) {
    console.error("❌ Preview route error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load preview",
    });
  }
});

// Check if course exists by slug
router.get("/check/:slug", checkCourseExists);

// Debug preview route - ADD THIS
router.get("/debug-preview/:courseId", debugEnhancedPreview);

// Get course by slug (public) - MUST be last
router.get("/slug/:slug", getPublicCourseBySlug);

// =========================================================
// PROTECTED ROUTES (Require Authentication)
// =========================================================

// Create new course (teacher/admin only)
router.post(
  "/",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

// Create course with units (teacher/admin only)
router.post(
  "/create-with-units",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadCourseFiles,
  createCourseWithUnits
);

// Delete course (teacher/admin only, and must own it)
router.delete(
  "/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  deleteCourse
);

// Update course (teacher/admin only, and must own it)
router.patch(
  "/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  updateCourse
);

// Get course for editing (teacher/admin only, and must own it)
router.get(
  "/edit/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  async (req, res) => {
    try {
      const course = req.resource; // From requireOwnership middleware

      res.json({
        success: true,
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          price: parseFloat(course.price) || 0,
          thumbnail: course.thumbnail,
          teacher_id: course.teacher_id,
          slug: course.slug,
          created_at: course.created_at,
          updated_at: course.updated_at,
        },
      });
    } catch (error) {
      console.error("Error fetching course for editing:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch course for editing",
      });
    }
  }
);

// =========================================================
// TEACHER DASHBOARD ROUTES
// =========================================================

// Get teacher's courses (simple list)
router.get(
  "/teacher/my-courses",
  authenticateToken,
  requireTeacher,
  getTeacherCourses
);

// Get teacher's courses with full structure
router.get(
  "/teacher/my-courses-detailed",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const courses = await Course.findAll({
        where: { teacher_id: teacherId },
        attributes: [
          "id",
          "title",
          "description",
          "slug",
          "price",
          "thumbnail",
          "created_at",
        ],
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
      res.status(500).json({
        success: false,
        error: "Failed to fetch courses",
      });
    }
  }
);

// Get teacher course full details
router.get(
  "/teacher/:courseId/full",
  authenticateToken,
  requireTeacher,
  getTeacherCourseFull
);

// =========================================================
// PREVIEW MANAGEMENT ROUTES
// =========================================================

// Check preview status for a course
router.get(
  "/preview/status/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  checkCoursePreviewStatus
);

// Mark/unmark lesson as preview
router.put(
  "/lessons/:lessonId/mark-preview",
  authenticateToken,
  requireTeacherOrAdmin,
  markLessonAsPreview
);

export default router;