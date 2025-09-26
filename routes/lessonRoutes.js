// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const lessonController = require("../controllers/lessonController");
// const authMiddleware = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware"); // if using multer

// // Fetch all lessons for a course
// router.get(
//   "/:courseId/lessons",
//   authMiddleware,
//   lessonController.getLessonsByCourse
// );

// // Create a new lesson for a course
// router.post(
//   "/:courseId/lessons",
//   authMiddleware,
//   upload.single("file"), // optional: for file uploads
//   lessonController.createLesson
// );

// // Get units for a course
// router.get(
//   "/:courseId/units",
//   authMiddleware,
//   lessonController.getUnitsByCourse
// );

// // Optional: Get a specific lesson
// router.get(
//   "/:courseId/lessons/:lessonId",
//   authMiddleware,
//   lessonController.getLessonById
// );

// // Optional: Update lesson
// router.patch(
//   "/:courseId/lessons/:lessonId",
//   authMiddleware,
//   lessonController.updateLesson
// );

// // Optional: Delete lesson
// router.delete(
//   "/:courseId/lessons/:lessonId",
//   authMiddleware,
//   lessonController.deleteLesson
// );

// module.exports = router;


// routes/lessonRoutes.js
import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import { authenticateToken, isTeacher, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Teachers/admins can create lessons
router.post("/", authenticateToken, isTeacher, createLesson);

// Get lessons for a course
router.get("/course/:courseId", authenticateToken, getLessonsByCourse);

// Get a single lesson
router.get("/:lessonId", authenticateToken, getLessonById);

// Update lesson
router.put("/:lessonId", authenticateToken, isTeacher, updateLesson);

// Delete lesson
router.delete("/:lessonId", authenticateToken, isTeacher, deleteLesson);

export default router;
