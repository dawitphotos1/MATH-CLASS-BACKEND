// // routes/lessonRoutes.js
// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// import uploadMiddleware from "../middleware/uploadMiddleware.js";
// import { requireAuth, requireRole } from "../middleware/authMiddleware.js"; // adjust to your auth middleware

// const router = express.Router();

// // Create lesson (multipart)
// router.post(
//   "/course/:courseId/lessons",
//   uploadMiddleware.uploadLessonFiles, // parses multipart into memory
//   lessonController.createLesson
// );

// // Update lesson (multipart)
// router.put(
//   "/:lessonId",
//   uploadMiddleware.uploadLessonFiles,
//   lessonController.updateLesson
// );

// // Get lesson
// router.get("/:id", lessonController.getLessonById);
// router.get("/preview/course/:courseId", lessonController.getPreviewLessonForCourse);
// router.get("/public-preview/:id", lessonController.getPublicPreviewByLessonId);

// // Debug
// router.get("/:lessonId/debug-file", lessonController.debugLessonFile);
// router.post("/:lessonId/fix-file", lessonController.fixLessonFileUrl);

// // Get lessons by course/unit
// router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
// router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// // Delete
// router.delete("/:lessonId", lessonController.deleteLesson);

// export default router;





import express from "express";
import lessonController from "../controllers/lessonController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create lesson (multipart)
router.post(
  "/course/:courseId/lessons",
  upload.uploadLessonFiles,
  lessonController.createLesson
);

// Update lesson (multipart)
router.put(
  "/:lessonId",
  upload.uploadLessonFiles,
  lessonController.updateLesson
);

// Get lesson by ID
router.get("/:id", lessonController.getLessonById);

// Preview endpoints
router.get(
  "/preview/course/:courseId",
  lessonController.getPreviewLessonForCourse
);
router.get(
  "/public-preview/:lessonId",
  lessonController.getPublicPreviewByLessonId
);

// Lessons by course / unit
router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// Delete
router.delete("/:lessonId", lessonController.deleteLesson);

export default router;
