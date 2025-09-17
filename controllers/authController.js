
// // controllers/authController.js
// const { User } = require("../models");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { sendSuccess, sendError } = require("../utils/response");

// // =========================
// // 🔹 Register
// // =========================
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: role.toLowerCase(),
//       approval_status: role === "student" ? "pending" : "approved",
//       subject: subject || null,
//       avatar: null, // default until user uploads one
//     });

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
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
//           role: user.role,
//           approval_status: user.approval_status,
//           subject: user.subject,
//           avatar: user.avatar, // ✅ include avatar
//         },
//       },
//       user.approval_status === "approved"
//         ? "Registration successful"
//         : "Registration pending approval"
//     );
//   } catch (error) {
//     return sendError(res, 500, "Registration failed", error.message);
//   }
// };

// // =========================
// // 🔹 Login
// // =========================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (!user) return sendError(res, 401, "Invalid credentials");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid credentials");

//     if (user.approval_status !== "approved") {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
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
//           role: user.role,
//           approval_status: user.approval_status,
//           subject: user.subject,
//           avatar: user.avatar, // ✅ include avatar
//         },
//       },
//       "Login successful"
//     );
//   } catch (error) {
//     return sendError(res, 500, "Login failed", error.message);
//   }
// };

// // =========================
// // 🔹 Me (current user)
// // =========================
// exports.me = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.userId, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "approval_status",
//         "subject",
//         "avatar", // ✅ fetch avatar too
//       ],
//     });

//     if (!user) return sendError(res, 404, "User not found");

//     return sendSuccess(res, {
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role.toLowerCase(),
//         approval_status: user.approval_status,
//         subject: user.subject,
//         avatar: user.avatar, // ✅ include avatar
//       },
//     });
//   } catch (err) {
//     return sendError(res, 500, "Failed to fetch user profile", err.message);
//   }
// };




// controllers/authController.js
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/response");

// =========================
// 🔹 Register
// =========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
      approval_status: role === "student" ? "pending" : "approved",
      subject: subject || null,
      avatar: null,
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
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
          role: user.role,
          approval_status: user.approval_status,
          subject: user.subject,
          avatar: user.avatar,
        },
      },
      user.approval_status === "approved"
        ? "Registration successful"
        : "Registration pending approval"
    );
  } catch (error) {
    return sendError(res, 500, "Registration failed", error.message);
  }
};

// =========================
// 🔹 Login
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) return sendError(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    if (user.approval_status !== "approved") {
      return sendError(res, 403, "Account pending approval");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
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
          role: user.role,
          approval_status: user.approval_status,
          subject: user.subject,
          avatar: user.avatar,
        },
      },
      "Login successful"
    );
  } catch (error) {
    return sendError(res, 500, "Login failed", error.message);
  }
};

// =========================
// 🔹 Me (get current user)
// =========================
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "approval_status",
        "subject",
        "avatar",
      ],
    });

    if (!user) return sendError(res, 404, "User not found");

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        approval_status: user.approval_status,
        subject: user.subject,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch user profile", err.message);
  }
};
