// // routes/lessonRoutes.js
// import express from "express";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import { isTeacherOrAdmin } from "../middleware/authMiddleware.js";
// import {
//   createLesson,
//   updateLesson,
//   deleteLesson,
//   getLessonById,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   debugLessonFile,
//   fixLessonFileUrl  // ✅ ADD THIS IMPORT
// } from "../controllers/lessonController.js";
// import { uploadLessonFiles } from "../middleware/cloudinaryUpload.js";

// const router = express.Router();

// /* -----------------------------------------------
//    📘 LESSON ROUTES
// ------------------------------------------------ */

// /**
//  * Debug lesson file info
//  */
// router.get("/debug/:lessonId/file-info", authenticateToken, debugLessonFile);

// /**
//  * Fix lesson file URL manually
//  */
// router.post("/:lessonId/fix-file", authenticateToken, fixLessonFileUrl);  // ✅ ADD THIS ROUTE

// /**
//  * Create a new lesson — allowed for teachers or admins only
//  */
// router.post(
//   "/course/:courseId",
//   authenticateToken,
//   isTeacherOrAdmin,
//   uploadLessonFiles,
//   createLesson
// );

// /**
//  * Update a lesson — teacher/admin only
//  */
// router.put(
//   "/:lessonId",
//   authenticateToken,
//   isTeacherOrAdmin,
//   uploadLessonFiles,
//   updateLesson
// );

// /**
//  * Delete a lesson — teacher/admin only
//  */
// router.delete(
//   "/:lessonId",
//   authenticateToken,
//   isTeacherOrAdmin,
//   deleteLesson
// );

// /**
//  * Get a single lesson (authenticated users only)
//  */
// router.get("/:lessonId", authenticateToken, getLessonById);

// /**
//  * Get all lessons for a course
//  */
// router.get("/course/:courseId/all", authenticateToken, getLessonsByCourse);

// /**
//  * Get all lessons for a unit
//  */
// router.get("/unit/:unitId/all", authenticateToken, getLessonsByUnit);

// export default router;



// routes/lessonRoutes.js
import express from "express";
import * as lessonController from "../controllers/lessonController.js"; // <-- FIXED
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================================================
   1. PREVIEW ROUTES (more specific — MUST COME FIRST)
   ======================================================= */
router.get(
  "/preview/course/:courseId",
  lessonController.getPreviewLessonForCourse
);

router.get(
  "/public-preview/:id",
  lessonController.getPublicPreviewByLessonId
);

/* =======================================================
   2. DEBUG / FIX ROUTES
   ======================================================= */
router.get(
  "/:lessonId/debug-file",
  lessonController.debugLessonFile
);

router.post(
  "/:lessonId/fix-file",
  lessonController.fixLessonFileUrl
);

/* =======================================================
   3. LISTING ROUTES
   ======================================================= */
router.get(
  "/course/:courseId/all",
  lessonController.getLessonsByCourse
);

router.get(
  "/unit/:unitId/all",
  lessonController.getLessonsByUnit
);

/* =======================================================
   4. CREATE + UPDATE ROUTES
   ======================================================= */

// Create lesson (multipart)
router.post(
  "/course/:courseId/lessons",
  uploadMiddleware.uploadLessonFiles,
  lessonController.createLesson
);

// Update lesson (multipart)
router.put(
  "/:lessonId",
  uploadMiddleware.uploadLessonFiles,
  lessonController.updateLesson
);

/* =======================================================
   5. DELETE ROUTE
   ======================================================= */
router.delete(
  "/:lessonId",
  lessonController.deleteLesson
);

/* =======================================================
   6. FINAL FALLBACK — GET BY ID (MUST BE LAST!)
   ======================================================= */
router.get(
  "/:id",
  lessonController.getLessonById
);

export default router;
