// // routes/lessonRoutes.js

// import express from "express";
// import {
//   createLesson,
//   getLessonsByCourse,
//   getLessonById,
//   updateLesson,
//   deleteLesson,
// } from "../controllers/lessonController.js";

// import {
//   authenticateToken,
//   isTeacher,
//   isAdmin,
// } from "../middleware/authMiddleware.js";
// import db from "../models/index.js";

// const { Lesson, Course } = db;

// const router = express.Router();

// // Teachers/admins can create lessons
// router.post("/", authenticateToken, isTeacher, createLesson);

// // Get lessons for a course
// router.get("/course/:courseId", authenticateToken, getLessonsByCourse);

// // Get a single lesson
// router.get("/:lessonId", authenticateToken, getLessonById);

// // Update lesson
// router.put("/:lessonId", authenticateToken, isTeacher, updateLesson);

// // Delete lesson
// router.delete("/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check if user is the teacher who owns the course or an admin
//     if (userRole !== "admin" && lesson.course.teacher_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this lesson",
//       });
//     }

//     await lesson.destroy();

//     res.json({
//       success: true,
//       message: "Lesson deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//     });
//   }
// });

// export default router;



// routes/lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { authenticateToken, isTeacher } from "../middleware/authMiddleware.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

/* ============================================================
   📚 LESSON ROUTES
============================================================ */

/**
 * ✅ Create a new lesson - SUPPORT BOTH URL PATTERNS
 * POST /api/v1/lessons
 * POST /api/v1/lessons/course/:courseId/lessons (for frontend compatibility)
 */
router.post(
  "/",
  isTeacher,
  uploadLessonFiles,
  createLesson
);

// ✅ ADD THIS ROUTE for frontend compatibility
router.post(
  "/course/:courseId/lessons",
  isTeacher,
  uploadLessonFiles,
  createLesson
);

/**
 * ✅ Get lessons by course ID - SUPPORT BOTH URL PATTERNS
 * GET /api/v1/lessons/course/:courseId
 * GET /api/v1/lessons/course/:courseId/units (for frontend compatibility)
 */
router.get("/course/:courseId", getLessonsByCourse);

// ✅ ADD THIS ROUTE for frontend compatibility
router.get("/course/:courseId/units", getLessonsByCourse);

/**
 * ✅ Get a single lesson by ID
 * GET /api/v1/lessons/:lessonId
 */
router.get("/:lessonId", getLessonById);

/**
 * ✅ Update a lesson
 * PUT /api/v1/lessons/:lessonId
 */
router.put(
  "/:lessonId",
  isTeacher,
  uploadLessonFiles,
  updateLesson
);

/**
 * ✅ Delete a lesson
 * DELETE /api/v1/lessons/:lessonId
 */
router.delete("/:lessonId", isTeacher, deleteLesson);

export default router;