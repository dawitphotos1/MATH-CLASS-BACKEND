
// // controllers/adminController.js
// const { User } = require("../models");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { sendSuccess, sendError } = require("../utils/response");

// // 🔹 Admin Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return sendError(res, 400, "Email and password required");

//     const user = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (!user) return sendError(res, 401, "Invalid credentials");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid credentials");

//     if (user.approval_status !== "approved") {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role.toLowerCase() },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return sendSuccess(
//       res,
//       {
//         token,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role.toLowerCase(),
//           approval_status: user.approval_status,
//         },
//       },
//       "Admin login successful"
//     );
//   } catch (error) {
//     return sendError(res, 500, "Server error", error.message);
//   }
// };

// // 🔹 Get Pending Users
// exports.getPendingUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { approval_status: "pending" },
//       attributes: ["id", "name", "email", "role", "approval_status", "subject"],
//     });

//     return sendSuccess(res, { users }, "Pending users fetched");
//   } catch (error) {
//     return sendError(res, 500, "Server error", error.message);
//   }
// };

// // 🔹 Approve/Reject User
// exports.updateUserApproval = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { status } = req.body;

//     const user = await User.findByPk(userId);
//     if (!user) return sendError(res, 404, "User not found");

//     user.approval_status = status.toLowerCase();
//     await user.save();

//     return sendSuccess(
//       res,
//       {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role.toLowerCase(),
//           approval_status: user.approval_status,
//         },
//       },
//       `User ${status}`
//     );
//   } catch (error) {
//     return sendError(res, 500, "Server error", error.message);
//   }
// };

// // 🔹 Get Enrollments (stub)
// exports.getEnrollments = async (req, res) => {
//   try {
//     const { status } = req.query;
//     return sendSuccess(
//       res,
//       { enrollments: [], status: status || "all" },
//       "Enrollments fetched"
//     );
//   } catch (error) {
//     return sendError(res, 500, "Server error", error.message);
//   }
// };



const { User, Course, UserCourseAccess } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/response");

// 🔹 Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendError(res, 400, "Email and password required");

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return sendError(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    if (user.approval_status !== "approved") {
      return sendError(res, 403, "Account pending approval");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          approval_status: user.approval_status,
        },
      },
      "Admin login successful"
    );
  } catch (error) {
    return sendError(res, 500, "Server error", error.message);
  }
};

// 🔹 Get Pending Users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approval_status: "pending" },
      attributes: ["id", "name", "email", "role", "approval_status", "subject"],
    });

    return sendSuccess(res, { users }, "Pending users fetched");
  } catch (error) {
    return sendError(res, 500, "Server error", error.message);
  }
};

// 🔹 Approve/Reject User
exports.updateUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return sendError(res, 404, "User not found");

    user.approval_status = status.toLowerCase();
    await user.save();

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          approval_status: user.approval_status,
        },
      },
      `User ${status}`
    );
  } catch (error) {
    return sendError(res, 500, "Server error", error.message);
  }
};

// 🔹 Get Enrollments
exports.getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { approval_status: status } : {};
    const enrollments = await UserCourseAccess.findAll({
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Course, attributes: ["id", "title"] },
      ],
      where,
    });

    return sendSuccess(
      res,
      {
        enrollments: enrollments.map((e) => ({
          id: e.id,
          student: { name: e.User.name, email: e.User.email },
          course: { title: e.Course.title },
        })),
        status: status || "all",
      },
      "Enrollments fetched"
    );
  } catch (error) {
    return sendError(res, 500, "Server error", error.message);
  }
};