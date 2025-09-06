// controllers/enrollmentController.js
const { UserCourseAccess, Course, User } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

// =========================
// Create a new enrollment request
// =========================
exports.createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Prevent duplicate enrollments
    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });
    if (existingAccess) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await UserCourseAccess.create({
      user_id: user.id,
      course_id: courseId,
      payment_status: "pending",
      approval_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send notification emails
    const student = await User.findByPk(user.id);

    if (student) {
      // Notify student
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);

      // Notify all admins
      const adminUsers = await User.findAll({ where: { role: "admin" } });
      for (const admin of adminUsers) {
        const content = enrollmentPendingAdmin(student, course);
        await sendEmail(admin.email, content.subject, content.html);
      }
    }

    res.status(201).json({
      success: true,
      message: "Enrollment request created, pending approval",
      enrollment,
    });
  } catch (error) {
    console.error("🔥 Create enrollment error:", error);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
};

// =========================
// Student Routes
// =========================

// Get all enrollments for logged-in student
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Course, as: "course" },
        { model: User, as: "student", attributes: ["id", "name", "email"] },
      ],
    });
    res.json({ enrollments });
  } catch (error) {
    console.error("🔥 Get my enrollments error:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

// Get only approved courses for logged-in student
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { user_id: req.user.id, approval_status: "approved" },
      include: [{ model: Course, as: "course" }],
    });

    res.json({ courses: enrollments.map((e) => e.course) });
  } catch (error) {
    console.error("🔥 Get my courses error:", error);
    res.status(500).json({ error: "Failed to fetch approved courses" });
  }
};

// Check if student is enrolled & approved
exports.checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await UserCourseAccess.findOne({
      where: {
        user_id: req.user.id,
        course_id: courseId,
        approval_status: "approved",
      },
    });
    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    console.error("🔥 Check enrollment error:", error);
    res.status(500).json({ error: "Failed to check enrollment" });
  }
};

// =========================
// Admin / Teacher Routes
// =========================

// Unified function for pending/approved
const getEnrollmentsByStatus = async (status, res) => {
  try {
    const enrollments = await UserCourseAccess.findAll({
      where: { approval_status: status },
      include: [
        { model: Course, as: "course" },
        { model: User, as: "student", attributes: ["id", "name", "email"] },
      ],
    });
    return res.json({ enrollments });
  } catch (error) {
    console.error(`🔥 Get ${status} enrollments error:`, error);
    return res
      .status(500)
      .json({ error: `Failed to fetch ${status} enrollments` });
  }
};

exports.getPendingEnrollments = (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  return getEnrollmentsByStatus("pending", res);
};

exports.getApprovedEnrollments = (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  return getEnrollmentsByStatus("approved", res);
};

// Approve a specific enrollment
exports.approveEnrollment = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const enrollment = await UserCourseAccess.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    enrollment.approved_by = req.user.id;
    enrollment.approved_at = new Date();
    await enrollment.save();

    res.json({ success: true, message: "Enrollment approved" });
  } catch (error) {
    console.error("🔥 Approve enrollment error:", error);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

// Reject & delete an enrollment
exports.rejectEnrollment = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const enrollment = await UserCourseAccess.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    await enrollment.destroy();
    res.json({ success: true, message: "Enrollment rejected & deleted" });
  } catch (error) {
    console.error("🔥 Reject enrollment error:", error);
    res.status(500).json({ error: "Failed to reject enrollment" });
  }
};
