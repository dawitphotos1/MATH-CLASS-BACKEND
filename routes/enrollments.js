
// // routes/enrollments.js
// import express from "express";
// import * as enrollmentController from "../controllers/enrollmentController.js";
// import authenticateToken from "../middleware/authenticateToken.js";

// const router = express.Router();

// // Protect all routes
// router.use(authenticateToken);

// // Student routes
// router.post("/", enrollmentController.createEnrollment);
// router.get("/my-enrollments", enrollmentController.getMyEnrollments);
// router.get("/my-courses", enrollmentController.getMyCourses);
// router.get("/check/:courseId", enrollmentController.checkEnrollment);

// // Admin / Teacher routes
// router.get("/pending", enrollmentController.getPendingEnrollments);
// router.get("/approved", enrollmentController.getApprovedEnrollments);
// router.put("/approve/:id", enrollmentController.approveEnrollment);
// router.delete("/reject/:id", enrollmentController.rejectEnrollment);

// export default router;




// routes/enrollments.js
import express from "express";
import * as enrollmentController from "../controllers/enrollmentController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import roleMiddleware from "../middleware/roleMiddleware.js"; // optional if you want to restrict admin-only routes

const router = express.Router();

// ✅ Protect all routes
router.use(authenticateToken);

// =========================
// 🎓 Student Routes
// =========================
router.post("/", enrollmentController.createEnrollment);
router.get("/my-enrollments", enrollmentController.getMyEnrollments);
router.get("/my-courses", enrollmentController.getMyCourses);
router.get("/check/:courseId", enrollmentController.checkEnrollment);
router.get("/eligibility/:courseId", enrollmentController.checkEnrollmentEligibility); // optional extra

// =========================
// 🧑‍🏫 Admin / Teacher Routes
// =========================
// Optional: wrap these with a role middleware if needed
// router.use(roleMiddleware(["admin", "teacher"]));

router.get("/pending", enrollmentController.getPendingEnrollments);
router.get("/approved", enrollmentController.getApprovedEnrollments);
router.put("/approve/:id", enrollmentController.approveEnrollment);
router.delete("/reject/:id", enrollmentController.rejectEnrollment);

export default router;
