// // routes/lessons.js
// import express from "express";
// import {
//   createLesson,
//   updateLesson,
//   getLessonById,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   deleteLesson,
// } from "../controllers/lessonController.js";
// import authenticateToken from "../middleware/authenticateToken.js";
// import cloudUpload from "../middleware/cloudinaryUpload.js";

// const router = express.Router();

// // Create lesson (courseId in params)
// router.post(
//   "/:courseId/lessons",
//   authenticateToken,
//   cloudUpload.fields([
//     { name: "video", maxCount: 1 },
//     { name: "pdf", maxCount: 1 },
//     { name: "file", maxCount: 1 },
//     { name: "attachments", maxCount: 10 },
//   ]),
//   createLesson
// );

// // Update lesson
// router.put(
//   "/:lessonId",
//   authenticateToken,
//   cloudUpload.fields([
//     { name: "video", maxCount: 1 },
//     { name: "pdf", maxCount: 1 },
//     { name: "file", maxCount: 1 },
//     { name: "attachments", maxCount: 10 },
//   ]),
//   updateLesson
// );

// // Get lesson by id
// router.get("/:lessonId", getLessonById);

// // Get lessons by course (public)
// router.get("/course/:courseId", getLessonsByCourse);

// // Get lessons by unit
// router.get("/unit/:unitId", getLessonsByUnit);

// // Delete lesson
// router.delete("/:lessonId", authenticateToken, deleteLesson);

// export default router;



// routes/lessons.js
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import { cloudUpload } from "../middleware/cloudinaryUpload.js";

import {
  createLesson,
  updateLesson,
  getLessonsByCourse,
  getLessonById,
  getPreviewLessonForCourse,
} from "../controllers/lessonController.js";

const router = express.Router();

const upload = cloudUpload.fields([
  { name: "video", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

router.post("/:courseId", authenticateToken, upload, createLesson);

router.get("/:courseId/all", getLessonsByCourse);

router.get("/view/:lessonId", authenticateToken, getLessonById);

router.put("/:lessonId", authenticateToken, upload, updateLesson);

router.get("/preview/:courseId", getPreviewLessonForCourse);

export default router;
