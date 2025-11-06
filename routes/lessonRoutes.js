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