
// // controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const { sendSuccess, sendError } = require("../utils/response");

// // ================================
// // 🔹 Register
// // ================================
// exports.register = async (req, res) => {
//   try {
//     let { name, email, password, role, subject } = req.body;
//     if (!name || !email || !password || !role) {
//       return sendError(res, 400, "All required fields must be filled");
//     }

//     role = role.toLowerCase();
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) return sendError(res, 409, "Email already registered");

//     const hashedPassword = await bcrypt.hash(password, 10);
//     let approval_status = role === "admin" || role === "teacher" ? "approved" : "pending";

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role === "student" ? subject : null,
//       approval_status,
//     });

//     let token = null;
//     if (approval_status === "approved") {
//       token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//       });
//     }

//     return sendSuccess(
//       res,
//       {
//         token,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role,
//           approval_status,
//         },
//       },
//       approval_status === "pending"
//         ? "Registration successful (pending approval)."
//         : "Registration successful.",
//       201
//     );
//   } catch (err) {
//     return sendError(res, 500, "Server error during registration", err.message);
//   }
// };

// // ================================
// // 🔹 Login
// // ================================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return sendError(res, 400, "Email and password required");

//     const user = await User.findOne({ where: { email } });
//     if (!user) return sendError(res, 401, "Invalid email or password");

//     const role = user.role.toLowerCase();
//     if (role === "student" && user.approval_status !== "approved") {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid email or password");

//     const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     user.lastLogin = new Date();
//     await user.save();

//     return sendSuccess(res, {
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role,
//         approval_status: user.approval_status,
//       },
//     }, "Login successful");
//   } catch (err) {
//     return sendError(res, 500, "Server error during login", err.message);
//   }
// };

// // ================================
// // 🔹 Me
// // ================================
// exports.me = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.userId, {
//       attributes: ["id", "name", "email", "role", "approval_status", "subject"],
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
//       },
//     });
//   } catch (err) {
//     return sendError(res, 500, "Failed to fetch user profile", err.message);
//   }
// };





// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendSuccess, sendError } = require("../utils/response");

// ================================
// 🔹 Register
// ================================
exports.register = async (req, res) => {
  try {
    let { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, 400, "All required fields must be filled");
    }

    role = role.toLowerCase();
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) return sendError(res, 409, "Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    let approval_status =
      role === "admin" || role === "teacher" ? "approved" : "pending";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      subject: role === "student" ? subject : null,
      approval_status,
    });

    let token = null;
    if (approval_status === "approved") {
      token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
    }

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          approval_status,
        },
      },
      approval_status === "pending"
        ? "Registration successful (pending approval)."
        : "Registration successful.",
      201
    );
  } catch (err) {
    return sendError(res, 500, "Server error during registration", err.message);
  }
};

// ================================
// 🔹 Login
// ================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, "Email and password required");
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return sendError(res, 401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid email or password");

    if (user.role.toLowerCase() === "student" && user.approval_status !== "approved") {
      return sendError(res, 403, "Account pending approval");
    }

    const token = jwt.sign({ userId: user.id, role: user.role.toLowerCase() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.lastLogin = new Date();
    await user.save();

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
      "Login successful"
    );
  } catch (err) {
    return sendError(res, 500, "Server error during login", err.message);
  }
};

// ================================
// 🔹 Current User (me)
// ================================
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "name", "email", "role", "approval_status", "subject"],
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
      },
    });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch user profile", err.message);
  }
};
