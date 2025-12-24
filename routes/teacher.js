// routes/teacher.js 
import express from "express";
import {
  getTeacherDashboard,
  getCourseAnalytics
} from "../controllers/teacherController.js";

import { authenticateToken, requireTeacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(authenticateToken, requireTeacher);

// Teacher dashboard
router.get("/dashboard", getTeacherDashboard);
router.get("/courses/:courseId/analytics", getCourseAnalytics);

// Make sure this line is at the end
export default router;