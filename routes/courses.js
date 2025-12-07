// // routes/courses.js
// import express from "express";
// import {
//   createCourse,
//   getCourses,
//   getPublicCourseBySlug,
//   getLessonsByCourse,
//   deleteCourse,
//   getCourseById,
//   createCourseWithUnits,
//   getTeacherCourses,
// } from "../controllers/courseController.js";

// import authenticateToken from "../middleware/authenticateToken.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/uploadMiddleware.js";
// import db from "../models/index.js";
// import { getPreviewLessonForCourse } from "../controllers/lessonController.js";

// const { Course, User, Lesson, Unit } = db;
// const router = express.Router();

// /* ========================================================
//    🟢 PUBLIC ROUTES — accessible without login
// ======================================================== */

// // Get all courses
// router.get("/", getCourses);

// // Get course by ID (public)
// router.get("/id/:id", getCourseById);

// // Get all lessons for a course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// // Simple debug/test endpoint
// router.get("/test/preview", async (req, res) => {
//   try {
//     await db.sequelize.authenticate();
//     const lessonCount = await Lesson.count();
//     const course84 = await Course.findByPk(84);
//     const previewLessons = await Lesson.findAll({
//       where: { course_id: 84, is_preview: true },
//       attributes: ["id", "title", "file_url", "video_url", "is_preview", "content_type"],
//     });
//     const allLessons = await Lesson.findAll({
//       where: { course_id: 84 },
//       order: [["order_index", "ASC"]],
//       attributes: ["id", "title", "is_preview", "order_index", "file_url"],
//     });
//     return res.json({
//       success: true,
//       message: "Test endpoint working",
//       totalLessons: lessonCount,
//       course84Exists: !!course84,
//       previewLessonsCount: previewLessons.length,
//       allLessonsCount: allLessons.length,
//       previewLessons: previewLessons,
//       allLessons: allLessons,
//     });
//   } catch (error) {
//     console.error("Test endpoint error:", error);
//     return res.status(500).json({ success: false, error: error?.message || "Server error" });
//   }
// });

// // PUBLIC: Get first preview lesson for a course
// router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// /* ========================================================
//    🔐 PROTECTED ROUTES — teachers / admins only
// ======================================================== */

// router.post(
//   "/",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create-with-units",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourseWithUnits
// );

// router.delete("/:id", authenticateToken, deleteCourse);

// /* ============================================================
//    👨🏫 TEACHER DASHBOARD ROUTES
// ============================================================ */

// router.get(
//   "/teacher/my-courses-detailed",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const teacherId = req.user.id;

//       const courses = await Course.findAll({
//         where: { teacher_id: teacherId },
//         attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
//         include: [
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id", "title", "description", "order_index"],
//             include: [
//               {
//                 model: Lesson,
//                 as: "lessons",
//                 attributes: [
//                   "id",
//                   "title",
//                   "content",
//                   "video_url",
//                   "file_url",
//                   "order_index",
//                   "content_type",
//                   "is_preview",
//                   "created_at",
//                 ],
//                 order: [["order_index", "ASC"]],
//               },
//             ],
//             order: [["order_index", "ASC"]],
//           },
//           {
//             model: User,
//             as: "teacher",
//             attributes: ["id", "name", "email"],
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });

//       res.json({ success: true, courses });
//     } catch (error) {
//       console.error("Error fetching teacher courses:", error);
//       res.status(500).json({ success: false, error: "Failed to fetch courses" });
//     }
//   }
// );

// router.get("/teacher/my-courses", authenticateToken, isTeacher, getTeacherCourses);

// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const teacherId = req.user.id;

//       const course = await Course.findOne({
//         where: { id: courseId, teacher_id: teacherId },
//         attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
//         include: [
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id", "title", "description", "order_index"],
//             include: [
//               {
//                 model: Lesson,
//                 as: "lessons",
//                 attributes: [
//                   "id",
//                   "title",
//                   "content",
//                   "video_url",
//                   "file_url",
//                   "order_index",
//                   "content_type",
//                   "is_preview",
//                   "created_at",
//                 ],
//                 order: [["order_index", "ASC"]],
//               },
//             ],
//             order: [["order_index", "ASC"]],
//           },
//         ],
//       });

//       if (!course) return res.status(404).json({ success: false, error: "Course not found or access denied" });
//       res.json({ success: true, course });
//     } catch (error) {
//       console.error("Error fetching course:", error);
//       res.status(500).json({ success: false, error: "Failed to fetch course" });
//     }
//   }
// );

// // ⚠ Slug route MUST be last because it catches all dynamic paths
// router.get("/:slug", getPublicCourseBySlug);

// export default router;





// routes/courses.js
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { cloudUpload } from "../middleware/cloudinaryUpload.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

import {
  createCourse,
  getCourses,
  getPublicCourseBySlug,
  deleteCourse,
  getCourseById,
  getTeacherCourses,
} from "../controllers/courseController.js";

const router = express.Router();

// upload: thumbnail only
const uploadThumbnail = cloudUpload.fields([
  { name: "thumbnail", maxCount: 1 },
]);

router.post("/", authenticateToken, uploadThumbnail, createCourse);
router.get("/", getCourses);

router.get("/slug/:slug", getPublicCourseBySlug);
router.get("/:id", getCourseById);

router.get("/teacher/me", authenticateToken, getTeacherCourses);

router.delete("/:id", authenticateToken, deleteCourse);

export default router;
