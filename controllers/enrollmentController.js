// controllers/enrollmentController.js
import db from "../models/index.js";

const { Enrollment, User, Course } = db;

// ========================
// Get enrollments by status
// ========================
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = status ? { approval_status: status } : {};

    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Approve enrollment
// ========================
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error("❌ approveEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Reject enrollment (optional)
// ========================
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error("❌ rejectEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
