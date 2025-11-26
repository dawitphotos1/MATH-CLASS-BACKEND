// // routes/lessonRoutes.js

// import express from "express";
// import {
//   createLesson,
//   getLessonsByCourse,
//   getRegularLessonsByCourse,
//   getLessonsByUnit,
//   getLessonById,
//   updateLesson,
//   deleteLesson,
//   debugGetLesson,
//   debugCheckFile,
//   debugFileUrl,
//   debugLessonType,
// } from "../controllers/lessonController.js";

// import {
//   getSubLessonsByLesson,
//   createSubLesson,
// } from "../controllers/sublessonController.js";

// import { authenticateToken } from "../middleware/authMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// /* ============================================================
//    CREATE LESSON
// ============================================================ */
// router.post(
//   "/courses/:courseId/lessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadLessonFiles,
//   createLesson
// );

// /* ============================================================
//    FETCH LESSONS BY COURSE
// ============================================================ */
// router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);

// /* Get only non-unit-header lessons */
// router.get(
//   "/courses/:courseId/regular-lessons",
//   authenticateToken,
//   getRegularLessonsByCourse
// );

// /* Fetch lessons under a unit */
// router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

// /* ============================================================
//    FIXED!! MUST COME BEFORE "/:lessonId"
//    Teacher Dashboard → Preview Lesson
// ============================================================ */
// router.get("/:lessonId/preview", authenticateToken, getLessonById);

// /* ============================================================
//    GET LESSON BY ID  (must stay AFTER preview route)
// ============================================================ */
// router.get("/:lessonId", authenticateToken, getLessonById);

// /* ============================================================
//    UPDATE + DELETE
// ============================================================ */
// router.put(
//   "/:lessonId",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadLessonFiles,
//   updateLesson
// );

// router.delete(
//   "/:lessonId",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   deleteLesson
// );

// /* ============================================================
//    SUB-LESSONS
// ============================================================ */
// router.get("/:lessonId/sublessons", authenticateToken, getSubLessonsByLesson);

// router.post(
//   "/:lessonId/sublessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   createSubLesson
// );

// /* ============================================================
//    DEBUG ROUTES
// ============================================================ */
// router.get("/debug/:lessonId", authenticateToken, debugGetLesson);
// router.get("/debug/file/:filename", authenticateToken, debugCheckFile);
// router.get("/debug/url/:lessonId", authenticateToken, debugFileUrl);
// router.get("/debug/type/:lessonId", authenticateToken, debugLessonType);

// router.get(
//   "/debug/course/:courseId/lessons",
//   authenticateToken,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       console.log("🐛 DEBUG: Fetching all lessons for course:", courseId);
//       await getLessonsByCourse(req, res);
//     } catch (error) {
//       console.error("🐛 DEBUG Course lessons error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );

// /* ============================================================
//    DEBUG FILE + TYPE CHECKER
// ============================================================ */
// router.get("/debug/test/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log("🔧 Debug test route called for lesson:", lessonId);

//     const db = await import("../models/index.js");
//     const lesson = await db.default.Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: db.default.Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "file_url",
//         "video_url",
//         "content_type",
//         "course_id",
//         "unit_id",
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: `Lesson ${lessonId} not found in database`,
//       });
//     }

//     const lessonData = lesson.toJSON();
//     const base =
//       process.env.BACKEND_URL ||
//       "https://mathe-class-website-backend-1.onrender.com";

//     if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//       lessonData.file_url = `${base}/api/v1/files${lessonData.file_url}`;
//     }
//     if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//       lessonData.video_url = `${base}/api/v1/files${lessonData.video_url}`;
//     }

//     res.json({
//       success: true,
//       lesson: {
//         id: lessonData.id,
//         title: lessonData.title,
//         file_url: lessonData.file_url,
//         video_url: lessonData.video_url,
//         content_type: lessonData.content_type,
//         course_id: lessonData.course_id,
//         course_teacher_id: lessonData.course?.teacher_id,
//         unit_id: lessonData.unit_id,
//       },
//       backend_url: process.env.BACKEND_URL,
//       file_exists: !!lessonData.file_url,
//     });
//   } catch (error) {
//     console.error("❌ Debug test route error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       backend_url: process.env.BACKEND_URL,
//     });
//   }
// });

// /* ============================================================
//    DEBUG Course lesson types
// ============================================================ */
// router.get(
//   "/debug/course-lesson-types/:courseId",
//   authenticateToken,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;

//       const db = await import("../models/index.js");
//       const Lesson = db.default.Lesson;

//       const lessons = await Lesson.findAll({
//         where: { course_id: courseId },
//         order: [["order_index", "ASC"]],
//         attributes: ["id", "title", "content_type", "order_index", "unit_id"],
//       });

//       const lessonTypes = lessons.map((l) => ({
//         id: l.id,
//         title: l.title,
//         type: l.content_type,
//         order: l.order_index,
//         unit_id: l.unit_id,
//         is_editable: l.content_type !== "unit_header",
//       }));

//       res.json({
//         success: true,
//         courseId,
//         total_lessons: lessons.length,
//         unit_headers: lessons.filter((l) => l.content_type === "unit_header")
//           .length,
//         regular_lessons: lessons.filter((l) => l.content_type !== "unit_header")
//           .length,
//         lessons: lessonTypes,
//       });
//     } catch (error) {
//       console.error("❌ Debug lesson types error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );

// export default router;






// routes/lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getRegularLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson,
  debugGetLesson,
  debugCheckFile,
  debugFileUrl,
  debugLessonType,
} from "../controllers/lessonController.js";

import {
  getSubLessonsByLesson,
  createSubLesson,
} from "../controllers/sublessonController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* CREATE LESSON */
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);

/* FETCH LESSONS BY COURSE */
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);

/* Get only non-unit-header lessons */
router.get(
  "/courses/:courseId/regular-lessons",
  authenticateToken,
  getRegularLessonsByCourse
);

/* Fetch lessons under a unit */
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

/* Preview route - placed before generic :lessonId to allow express matching */
router.get("/:lessonId/preview", authenticateToken, getLessonById);

/* GET LESSON BY ID */
router.get("/:lessonId", authenticateToken, getLessonById);

/* UPDATE + DELETE */
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

/* SUB-LESSONS */
router.get("/:lessonId/sublessons", authenticateToken, getSubLessonsByLesson);

router.post(
  "/:lessonId/sublessons",
  authenticateToken,
  checkTeacherOrAdmin,
  createSubLesson
);

/* DEBUG ROUTES */
router.get("/debug/:lessonId", authenticateToken, debugGetLesson);
router.get("/debug/file/:filename", authenticateToken, debugCheckFile);
router.get("/debug/url/:lessonId", authenticateToken, debugFileUrl);
router.get("/debug/type/:lessonId", authenticateToken, debugLessonType);

/* DEBUG: course lessons */
router.get("/debug/course/:courseId/lessons", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    await getLessonsByCourse(req, res);
  } catch (error) {
    console.error("DEBUG Course lessons error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

