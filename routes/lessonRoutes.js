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

// Lesson routes
router.post(
  "/courses/:courseId/lessons",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadLessonFiles,
  createLesson
);
router.get("/courses/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.get("/units/:unitId/lessons", authenticateToken, getLessonsByUnit);
router.get("/:lessonId", authenticateToken, getLessonById);
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

// Add this to your lessonRoutes.js temporarily
router.put("/test-upload/:lessonId", authenticateToken, uploadLessonFiles, async (req, res) => {
  try {
    console.log("🧪 TEST UPLOAD - Body:", req.body);
    console.log("🧪 TEST UPLOAD - Files:", req.files);
    console.log("🧪 TEST UPLOAD - Params:", req.params);
    console.log("🧪 TEST UPLOAD - User:", req.user);
    
    res.json({
      success: true,
      message: "Test successful",
      data: {
        body: req.body,
        files: req.files,
        params: req.params,
        user: req.user
      }
    });
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});




// Debug route to test connectivity
router.get("/debug/:lessonId", authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🔍 Debug route called for lesson:", lessonId);
    
    const db = await import("../models/index.js");
    const lesson = await db.default.Lesson.findByPk(lessonId, {
      include: [{
        model: db.default.Course,
        as: "course",
        attributes: ["id", "title", "teacher_id"]
      }]
    });
    
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
        course_id: lesson.course_id,
        course_teacher_id: lesson.course?.teacher_id,
        unit_id: lesson.unit_id
      } 
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;