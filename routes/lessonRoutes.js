// // routes/lessonRoutes.js

// import express from "express";
// import {
//   createLesson,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   getLessonById,
//   updateLesson,
//   deleteLesson,
// } from "../controllers/lessonController.js";

// import { authenticateToken } from "../middleware/authMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// /* --- CREATE LESSON --- */
// router.post(
//   "/courses/:courseId/lessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadLessonFiles,
//   createLesson
// );

// /* --- COURSE + UNIT LIST --- */
// router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
// router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

// /* --- GET LESSON BY ID (MULTIPLE ROUTES) --- */
// // Add this missing route that the frontend is expecting
// router.get("/:lessonId", authenticateToken, getLessonById);
// router.get("/id/:lessonId", authenticateToken, getLessonById);
// router.get("/preview/:lessonId", authenticateToken, getLessonById);

// /* --- UPDATE / DELETE --- */
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

// export default router;


// routes/lessonRoutes.js
import express from "express";
import { authenticateToken, authorizeTeacherOrAdmin } from "../middleware/authMiddleware.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getLessonsByCourse,
  getLessonsByUnit,
} from "../controllers/lessonController.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* -----------------------------------------------
   LESSON ROUTES
------------------------------------------------ */

// Create lesson (teacher/admin only)
router.post(
  "/course/:courseId",
  authenticateToken,
  authorizeTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);

// Update lesson
router.put(
  "/:lessonId",
  authenticateToken,
  authorizeTeacherOrAdmin,
  uploadLessonFiles,
  updateLesson
);

// Delete lesson
router.delete(
  "/:lessonId",
  authenticateToken,
  authorizeTeacherOrAdmin,
  deleteLesson
);

// Get single lesson
router.get("/:lessonId", authenticateToken, getLessonById);

// Lessons by course
router.get("/course/:courseId/all", authenticateToken, getLessonsByCourse);

// Lessons by unit
router.get("/unit/:unitId/all", authenticateToken, getLessonsByUnit);

export default router;
