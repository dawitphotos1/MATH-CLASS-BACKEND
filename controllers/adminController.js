// // controllers/adminController.js
// const { User, UserCourseAccess, Course } = require("../models");
// const sendEmail = require("../utils/sendEmail");

// // =======================
// // 📊 DASHBOARD STATS
// // =======================
// const getDashboardStats = async (req, res) => {
//   try {
//     const totalStudents = await User.count({ where: { role: "student" } });
//     const pendingUsers = await User.count({
//       where: { role: "student", approval_status: "pending" },
//     });
//     const pendingEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "pending", payment_status: "paid" },
//     });
//     const approvedEnrollments = await UserCourseAccess.count({
//       where: { approval_status: "approved" },
//     });

//     res.status(200).json({
//       totalStudents,
//       pendingUsers,
//       pendingEnrollments,
//       approvedEnrollments,
//     });
//   } catch (error) {
//     console.error("🔥 Dashboard error:", error);
//     res.status(500).json({ error: "Failed to load dashboard stats" });
//   }
// };

// // =======================
// // 👤 PENDING USERS
// // =======================
// const getPendingUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { role: "student", approval_status: "pending" },
//       attributes: ["id", "name", "email", "role", "subject", "approval_status"],
//       order: [["createdAt", "ASC"]],
//     });

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("🔥 Pending users error:", error);
//     res.status(500).json({ error: "Failed to fetch pending users" });
//   }
// };

// // =======================
// // 👤 APPROVED / REJECTED USERS
// // =======================
// const getApprovedOrRejectedUsers = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     if (!["approved", "rejected"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'approved' or 'rejected'" });
//     }

//     const users = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: ["id", "name", "email", "role", "subject", "approval_status"],
//     });

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("🔥 Users by status error:", error);
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };

// // =======================
// // 📘 ENROLLMENTS
// // =======================
// const getEnrollments = async (req, res) => {
//   try {
//     const status = req.query.status?.toLowerCase();
//     if (!["pending", "approved"].includes(status)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status, must be 'pending' or 'approved'" });
//     }

//     const enrollments = await UserCourseAccess.findAll({
//       where: { approval_status: status },
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//     });

//     res.status(200).json({ enrollments });
//   } catch (error) {
//     console.error("🔥 Enrollments error:", error);
//     res.status(500).json({ error: "Failed to fetch enrollments" });
//   }
// };

// // =======================
// // ✅ APPROVE USER
// // =======================
// const approveUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id, { transaction });

//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       return res.status(404).json({ error: "Student not found" });
//     }

//     await user.update({ approval_status: "approved" }, { transaction });

//     // Send email (non-blocking)
//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account has been approved ✅",
//         `<p>Hello ${user.name},</p>
//          <p>Your MathClass account has been approved. You may now 
//          <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
//       );
//     } catch (err) {
//       console.error("❌ Email failed:", err.message);
//     }

//     await transaction.commit();
//     res.status(200).json({ message: "User approved" });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Approve user error:", error);
//     res.status(500).json({ error: "Failed to approve user" });
//   }
// };

// // =======================
// // ❌ REJECT USER
// // =======================
// const rejectUser = async (req, res) => {
//   const transaction = await User.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     const user = await User.findByPk(id, { transaction });

//     if (!user || user.role !== "student") {
//       await transaction.rollback();
//       return res.status(404).json({ error: "Student not found" });
//     }

//     await user.update({ approval_status: "rejected" }, { transaction });

//     // Send email (non-blocking)
//     try {
//       await sendEmail(
//         user.email,
//         "Your MathClass account was rejected ❌",
//         `<p>Hello ${user.name},</p>
//          <p>Unfortunately, your account has been rejected. 
//          If you believe this is a mistake, please contact support.</p>`
//       );
//     } catch (err) {
//       console.error("❌ Email failed:", err.message);
//     }

//     await transaction.commit();
//     res.status(200).json({ message: "User rejected" });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("🔥 Reject user error:", error);
//     res.status(500).json({ error: "Failed to reject user" });
//   }
// };

// module.exports = {
//   getDashboardStats,
//   getPendingUsers,
//   getApprovedOrRejectedUsers,
//   getEnrollments,
//   approveUser,
//   rejectUser,
// };



const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", { email });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.log("Login failed: User not found", { email });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed: Incorrect password", { email });
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.approval_status !== "approved") {
      console.log("Login failed: Account not approved", {
        email,
        approval_status: user.approval_status,
      });
      return res.status(403).json({ error: "Account pending approval" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login successful:", { email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};