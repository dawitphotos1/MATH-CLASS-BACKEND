// // routes/lessonRoutes.js

// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // Create lesson (multipart)
// router.post(
//   "/course/:courseId/lessons",
//   upload.uploadLessonFiles,
//   lessonController.createLesson
// );

// // Update lesson (multipart)
// router.put(
//   "/:lessonId",
//   upload.uploadLessonFiles,
//   lessonController.updateLesson
// );

// // Get lesson by ID
// router.get("/:id", lessonController.getLessonById);

// // Preview endpoints
// router.get(
//   "/preview/course/:courseId",
//   lessonController.getPreviewLessonForCourse
// );
// router.get(
//   "/public-preview/:lessonId",
//   lessonController.getPublicPreviewByLessonId
// );

// // Lessons by course / unit
// router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
// router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// // Delete
// router.delete("/:lessonId", lessonController.deleteLesson);

// export default router;





// routes/lessonRoutes.js

import express from "express";
import lessonController from "../controllers/lessonController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* -------------------------
   CREATE LESSON (multipart)
------------------------- */
router.post(
  "/course/:courseId/lessons",
  upload.uploadLessonFiles,
  async (req, res, next) => {
    try {
      await upload.processUploadedFiles(req);
      next();
    } catch (err) {
      console.error("Upload processing failed:", err);
      return res
        .status(500)
        .json({ success: false, error: "File upload failed" });
    }
  },
  lessonController.createLesson
);

/* -------------------------
   UPDATE LESSON (multipart)
------------------------- */
router.put(
  "/:lessonId",
  upload.uploadLessonFiles,
  async (req, res, next) => {
    try {
      await upload.processUploadedFiles(req);
      next();
    } catch (err) {
      console.error("Upload processing failed:", err);
      return res
        .status(500)
        .json({ success: false, error: "File upload failed" });
    }
  },
  lessonController.updateLesson
);

/* -------------------------
   READ
------------------------- */
router.get("/:id", lessonController.getLessonById);

router.get(
  "/preview/course/:courseId",
  lessonController.getPreviewLessonForCourse
);

router.get(
  "/public-preview/:lessonId",
  lessonController.getPublicPreviewByLessonId
);

router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

/* -------------------------
   DELETE
------------------------- */
router.delete("/:lessonId", lessonController.deleteLesson);

export default router;
