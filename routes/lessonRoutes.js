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

// /* CREATE LESSON */
// router.post(
//   "/courses/:courseId/lessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadLessonFiles,
//   createLesson
// );

// /* FETCH LESSONS BY COURSE */
// router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);

// /* Get only non-unit-header lessons */
// router.get(
//   "/courses/:courseId/regular-lessons",
//   authenticateToken,
//   getRegularLessonsByCourse
// );

// /* Fetch lessons under a unit */
// router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

// /* Preview route - placed before generic :lessonId to allow express matching */
// router.get("/:lessonId/preview", authenticateToken, getLessonById);

// /* GET LESSON BY ID */
// router.get("/:lessonId", authenticateToken, getLessonById);

// /* UPDATE + DELETE */
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

// /* SUB-LESSONS */
// router.get("/:lessonId/sublessons", authenticateToken, getSubLessonsByLesson);

// router.post(
//   "/:lessonId/sublessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   createSubLesson
// );

// /* DEBUG ROUTES */
// router.get("/debug/:lessonId", authenticateToken, debugGetLesson);
// router.get("/debug/file/:filename", authenticateToken, debugCheckFile);
// router.get("/debug/url/:lessonId", authenticateToken, debugFileUrl);
// router.get("/debug/type/:lessonId", authenticateToken, debugLessonType);

// /* DEBUG: course lessons */
// router.get("/debug/course/:courseId/lessons", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     await getLessonsByCourse(req, res);
//   } catch (error) {
//     console.error("DEBUG Course lessons error:", error);
//     res.status(500).json({ success: false, error: error.message });
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

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { uploadLessonFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* --- CREATE LESSON --- */
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);

/* --- COURSE + UNIT LIST --- */
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);

/* --- SAFE, NON-CONFLICT ROUTES --- */
router.get("/id/:lessonId", authenticateToken, getLessonById);
router.get("/preview/:lessonId", authenticateToken, getLessonById);

/* --- UPDATE / DELETE --- */
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

export default router;
