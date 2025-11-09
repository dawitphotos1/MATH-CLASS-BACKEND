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

// // ✅ CORRECT IMPORTS - using default export for checkTeacherOrAdmin
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js"; // Default import
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // Lesson routes
// router.post(
//   "/courses/:courseId/lessons",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   upload,
//   createLesson
// );
// router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
// router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);
// router.get("/lessons/:lessonId", authenticateToken, getLessonById);
// router.put(
//   "/lessons/:lessonId",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   upload,
//   updateLesson
// );
// router.delete(
//   "/lessons/:lessonId",
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

// 🔥 FIXED ROUTES - Remove duplicate "lessons" from paths
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);
router.get("/:lessonId", authenticateToken, getLessonById); // 🔥 FIXED: Remove "lessons/" prefix
router.put(
  "/:lessonId", // 🔥 FIXED: Remove "lessons/" prefix
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  updateLesson
);
router.delete(
  "/:lessonId", // 🔥 FIXED: Remove "lessons/" prefix
  authenticateToken,
  checkTeacherOrAdmin,
  deleteLesson
);

// 🔥 ADD DEBUG ROUTE TO TEST CONNECTIVITY
router.get("/debug/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🔍 Debug route called for lesson:", lessonId);
    
    const { Lesson } = await import("../models/index.js");
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        error: `Lesson ${lessonId} not found in database` 
      });
    }
    
    res.json({ 
      success: true, 
      lesson: { 
        id: lesson.id, 
        title: lesson.title,
        course_id: lesson.course_id 
      } 
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;