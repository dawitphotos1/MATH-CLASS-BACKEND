// const { UserCourseAccess } = require("../models");

// exports.checkEnrollment = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const user = req.user;
//     console.log(`Checking enrollment for user ${user.id}, course ${courseId}`);

//     const enrollment = await UserCourseAccess.findOne({
//       where: {
//         user_id: user.id, // Use snake_case
//         course_id: courseId, // Use snake_case
//         approval_status: "approved",
//       },
//     });

//     res.json({ isEnrolled: !!enrollment });
//   } catch (error) {
//     console.error("🔥 Check enrollment error:", error.message, error.stack);
//     res
//       .status(500)
//       .json({ error: "Failed to check enrollment", details: error.message });
//   }
// };

// // Placeholder for other controller methods
// exports.createEnrollment = async (req, res) => {
//   // Implement as needed
// };
// exports.getMyEnrollments = async (req, res) => {
//   // Implement as needed
// };
// exports.getMyCourses = async (req, res) => {
//   // Implement as needed
// };
// exports.getPendingEnrollments = async (req, res) => {
//   // Implement as needed
// };
// exports.getApprovedEnrollments = async (req, res) => {
//   // Implement as needed
// };
// exports.approveEnrollment = async (req, res) => {
//   // Implement as needed
// };
// exports.rejectEnrollment = async (req, res) => {
//   // Implement as needed
// };

// module.exports = exports;


// routes/enrollmentRoutes.js
import express from "express";
import * as enrollmentController from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ====================
// Student routes
// ====================
router.post("/request", protect, enrollmentController.createEnrollment);
router.get("/my-enrollments", protect, enrollmentController.getMyEnrollments);
router.get("/my-courses", protect, enrollmentController.getMyCourses);
router.get("/status/:courseId", protect, enrollmentController.checkEnrollment);

// ====================
// Admin / teacher routes
// ====================
router.get("/pending", protect, enrollmentController.getPendingEnrollments);
router.get("/approved", protect, enrollmentController.getApprovedEnrollments);
router.patch("/:id/approve", protect, enrollmentController.approveEnrollment);
router.delete("/:id/reject", protect, enrollmentController.rejectEnrollment);

export default router;
