
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
//       attributes: { exclude: ["password"] },
//       order: [["createdAt", "ASC"]],
//     });
//     res.json({ users });
//   } catch (err) {
//     console.error("❌ getPendingUsers error:", err.message);
//     console.error(err.stack);
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

//     res.json({ user });
//   } catch (err) {
//     console.error("❌ updateUserApproval error:", err.message);
//     console.error(err.stack);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Get enrollments
// // ====================
// export const getEnrollments = async (req, res) => {
//   try {
//     const { status } = req.query;

//     const whereClause = status ? { approval_status: status } : {};

//     const enrollments = await Enrollment.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           as: "student", // must match Enrollment.belongsTo(..., as: "student")
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Course,
//           as: "course", // must match Enrollment.belongsTo(..., as: "course")
//           attributes: ["id", "title"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ enrollments });
//   } catch (err) {
//     console.error("❌ getEnrollments error:", err.message);
//     console.error(err.stack);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Approve enrollment
// // ====================
// export const approveEnrollment = async (req, res) => {
//   try {
//     const { enrollmentId } = req.params;

//     const enrollment = await Enrollment.findByPk(enrollmentId);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     res.json({ enrollment });
//   } catch (err) {
//     console.error("❌ approveEnrollment error:", err.message);
//     console.error(err.stack);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// controllers/adminController.js
import db from "../models/index.js";

const { User, Enrollment, Course } = db;

// ====================
// Get pending users
// ====================
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approval_status: "pending" },
      attributes: { exclude: ["password"] }, // ✅ never send password
      order: [["createdAt", "DESC"]],
    });

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

    res.json({ success: true, user });
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
        {
          model: User,
          as: "student", // ✅ matches Enrollment.belongsTo(User, { as: "student" })
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course", // ✅ matches Enrollment.belongsTo(Course, { as: "course" })
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

// ====================
// Approve enrollment
// ====================
export const approveEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId, {
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
