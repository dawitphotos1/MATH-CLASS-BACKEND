// routes/teacher.js
import express from "express";
import { 
  getTeacherDashboard, 
  getCourseAnalytics 
} from "../controllers/teacherController.js";
import { authenticateToken, isTeacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(authenticateToken, isTeacher);

// Teacher dashboard
router.get("/dashboard", getTeacherDashboard);
router.get("/courses/:courseId/analytics", getCourseAnalytics);

export default router;