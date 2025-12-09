// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorize: roleMiddleware } = require("../middleware/roleMiddleware");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const { uploadCourseFiles } = require("../middleware/cloudinaryUpload.js");

// Create a new course
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  uploadCourseFiles,
  courseController.createCourse
);

// Fetch courses for logged-in user (teacher/admin)
router.get("/", authMiddleware, courseController.getTeacherCourses);

// Public route to fetch a course by slug (no auth required)
router.get("/public/slug/:slug", courseController.getCourseBySlug);

// Get a course by its numeric ID (used by Payment.jsx)
router.get("/:id", courseController.getCourseById);

// Fetch full course by slug (requires enrollment)
router.get(
  "/enrolled/slug/:slug",
  authMiddleware,
  courseController.getEnrolledCourseBySlug
);

// Get lessons by course ID
router.get(
  "/:courseId/lessons",
  authMiddleware,
  courseController.getLessonsByCourse
);

// Delete a course by ID
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  courseController.deleteCourse
);

// Rename course attachment
router.patch(
  "/:courseId/attachments/:index/rename",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.renameAttachment
);

// Delete course attachment
router.patch(
  "/:courseId/attachments/:index/delete",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.deleteAttachment
);

// Admin: Get all courses
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  courseController.getAllCourses
);

module.exports = router;