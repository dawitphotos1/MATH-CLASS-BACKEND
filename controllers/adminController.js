
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
import db from "../models/index.js";

const { User, Enrollment, Course } = db;

/**
 * GET /api/v1/admin/pending-users
 * Return users with approval_status = 'pending' (usually newly-registered students)
 */
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approval_status: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, users });
  } catch (err) {
    console.error("❌ getPendingUsers error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * PATCH /api/v1/admin/users/:id/approval
 * Body: { status: "approved" | "rejected" }
 */
export const updateUserApproval = async (req, res) => {
  try {
    const userId = req.params.id || req.params.userId; // support either param name
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    user.approval_status = status;
    await user.save();

    return res.json({ success: true, user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subject: user.subject,
      approval_status: user.approval_status,
    }});
  } catch (err) {
    console.error("❌ updateUserApproval error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * GET /api/v1/admin/enrollments?status=pending
 * Return enrollments optionally filtered by approval_status
 */
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};
    if (status) whereClause.approval_status = status;

    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ getEnrollments error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/**
 * PUT /api/v1/admin/enrollments/:id/approve
 * Approve a specific enrollment
 */
export const approveEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id || req.params.enrollmentId;
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    // Optionally: create UserCourseAccess or other side-effects here

    return res.json({ success: true, enrollment });
  } catch (err) {
    console.error("❌ approveEnrollment error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
