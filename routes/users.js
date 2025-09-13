// ✅ routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, UserCourseAccess, Course } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const Stripe = require("stripe");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");
const userController = require("../controllers/userController");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function isAdminOrTeacher(req, res, next) {
  if (req.user && ["admin", "teacher"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: "Forbidden" });
}

router.get("/me", authMiddleware, userController.getMyProfile);

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    email = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "No user found with this email" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Incorrect password" });
    if (user.approval_status === "pending")
      return res
        .status(403)
        .json({ error: "Your account is pending approval" });
    if (user.approval_status === "rejected")
      return res.status(403).json({ error: "Your account has been rejected" });
    if (!process.env.JWT_SECRET)
      return res
        .status(500)
        .json({ error: "Server error: missing JWT secret" });
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approval_status: user.approval_status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
});

// ✅ Get pending/approved/rejected students
router.get("/pending", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { approval_status: "pending", role: "student" },
      attributes: ["id", "name", "email", "role", "subject", "createdAt"],
    });
    res.json(pendingUsers);
  } catch (err) {
    console.error("❌ Error fetching pending users:", err);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

router.get("/approved", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const approvedUsers = await User.findAll({
      where: { approval_status: "approved", role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(approvedUsers);
  } catch (err) {
    console.error("❌ Error fetching approved users:", err);
    res.status(500).json({ error: "Failed to fetch approved users" });
  }
});

router.get("/rejected", authMiddleware, isAdminOrTeacher, async (req, res) => {
  try {
    const rejectedUsers = await User.findAll({
      where: { approval_status: "rejected", role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(rejectedUsers);
  } catch (err) {
    console.error("❌ Error fetching rejected users:", err);
    res.status(500).json({ error: "Failed to fetch rejected users" });
  }
});

// ✅ Approve/reject user
router.post(
  "/approve/:id",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.approval_status = "approved";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account has been approved ✅",
        `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
      );

      res.json({ message: "User approved successfully" });
    } catch (err) {
      console.error("❌ Error approving user:", err);
      res.status(500).json({ error: "Failed to approve user" });
    }
  }
);

router.post(
  "/reject/:id",
  authMiddleware,
  isAdminOrTeacher,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.approval_status = "rejected";
      await user.save();

      await sendEmail(
        user.email,
        "Your MathClass account was rejected ❌",
        `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
      );

      res.json({ message: "User rejected successfully" });
    } catch (err) {
      console.error("❌ Error rejecting user:", err);
      res.status(500).json({ error: "Failed to reject user" });
    }
  }
);

// ✅ Delete user
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.json({ message: "User deleted successfully" });

    if (
      req.user.id !== parseInt(req.params.id) &&
      !["admin", "teacher"].includes(req.user.role)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ✅ Confirm enrollment (Stripe)
router.post("/confirm-enrollment", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id)
      return res.status(400).json({ error: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid")
      return res.status(400).json({ error: "Payment not completed" });

    const userId = req.user.id;
    const courseId = parseInt(session.metadata?.courseId, 10);
    if (!courseId || isNaN(courseId))
      return res.status(400).json({ error: "Invalid course ID" });

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ error: `Course not found for ID ${courseId}` });

    let enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (enrollment) {
      if (enrollment.approved)
        return res.status(400).json({ error: "Already enrolled" });

      enrollment.approved = true;
      enrollment.accessGrantedAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await UserCourseAccess.create({
        userId,
        courseId,
        approved: true,
        accessGrantedAt: new Date(),
      });
    }

    const user = await User.findByPk(userId);
    if (user && course) {
      const { subject, html } = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, subject, html);
    }

    res.json({ success: true, message: "Enrollment confirmed successfully" });
  } catch (err) {
    console.error("Error confirming enrollment:", err);
    res.status(500).json({
      success: false,
      error: "Failed to confirm enrollment",
      details: err.message,
    });
  }
});

// ✅ Get student's enrolled + approved courses
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const accessRecords = await UserCourseAccess.findAll({
      where: { userId, approved: true },
      include: [
        {
          model: Course,
          as: "course",
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    const enrolledCourses = accessRecords
      .filter((record) => record.course)
      .map((record) => record.course);

    res.json({ success: true, courses: enrolledCourses });
  } catch (err) {
    console.error("❌ Error fetching enrolled courses:", err);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
});

module.exports = router;
