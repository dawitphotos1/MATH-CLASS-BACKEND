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
import {
  createLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* CREATE */
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);

/* LIST */
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

/* PREVIEW (define before generic :lessonId if you prefer, but both work) */
router.get("/:lessonId/preview", authenticateToken, getLessonById);

/* GET BY ID */
router.get("/:lessonId", authenticateToken, getLessonById);

/* UPDATE / DELETE */
router.put(
  "/:lessonId",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  updateLesson
);
router.delete("/:lessonId", authenticateToken, checkTeacherOrAdmin, deleteLesson);

export default router;
