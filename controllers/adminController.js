
// // controllers/adminController.js
// import db from "../models/index.js";

// const { User, Enrollment, Course } = db;

// // ====================
// // Get pending users
// // ====================
// export const getPendingUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { approval_status: "pending" },
//       attributes: { exclude: ["password"] }, // ✅ never send password
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ users });
//   } catch (err) {
//     console.error("❌ getPendingUsers error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Update user approval
// // ====================
// export const updateUserApproval = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { status } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.approval_status = status;
//     await user.save();

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error("❌ updateUserApproval error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Get enrollments
// // ====================
// export const getEnrollments = async (req, res) => {
//   try {
//     const { status } = req.query;

//     const enrollments = await Enrollment.findAll({
//       where: status ? { approval_status: status } : {},
//       include: [
//         {
//           model: User,
//           as: "student", // ✅ matches Enrollment.belongsTo(User, { as: "student" })
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Course,
//           as: "course", // ✅ matches Enrollment.belongsTo(Course, { as: "course" })
//           attributes: ["id", "title"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ enrollments });
//   } catch (err) {
//     console.error("❌ getEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Approve enrollment
// // ====================
// export const approveEnrollment = async (req, res) => {
//   try {
//     const { enrollmentId } = req.params;

//     const enrollment = await Enrollment.findByPk(enrollmentId, {
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     res.json({ success: true, enrollment });
//   } catch (err) {
//     console.error("❌ approveEnrollment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// controllers/adminController.js
import User from "../models/User.js";

/**
 * Get students by approval status
 * @route GET /admin/students?status=pending|approved|rejected
 */
export const getStudentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }

    const students = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
    });

    return res.json({ students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

/**
 * Approve a student
 * @route PATCH /admin/students/:id/approve
 */
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByPk(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "approved";
    await student.save();

    return res.json({ message: "Student approved", student });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ error: "Failed to approve student" });
  }
};

/**
 * Reject a student
 * @route PATCH /admin/students/:id/reject
 */
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByPk(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "rejected";
    await student.save();

    return res.json({ message: "Student rejected", student });
  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ error: "Failed to reject student" });
  }
};
