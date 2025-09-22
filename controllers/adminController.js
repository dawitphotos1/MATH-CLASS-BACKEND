
// controllers/adminController.js
import db from "../models/index.js";

const { User, Enrollment, Course } = db;

// ====================
// Get pending users
// ====================
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { approval_status: "pending" } });
    res.json({ users });
  } catch (err) {
    console.error("❌ getPendingUsers error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Update user approval
// ====================
export const updateUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.approval_status = status;
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error("❌ updateUserApproval error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Get enrollments
// ====================
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const enrollments = await Enrollment.findAll({
      where: status ? { approval_status: status } : {},
      include: [
        { model: User, as: "student" },
        { model: Course, as: "course" },
      ],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Approve enrollment
// ====================
export const approveEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    res.json({ enrollment });
  } catch (err) {
    console.error("❌ approveEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
