
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");
// const { sendSuccess, sendError } = require("../utils/response");

// // 🔐 Helper to generate JWT
// const generateToken = (user) => {
//   return jwt.sign(
//     { userId: user.id, role: user.role.toLowerCase() },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_EXPIRATION_TIME || "180d", // fallback 180 days
//     }
//   );
// };

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
//     const existingUser = await User.findOne({
//       where: { email: email.toLowerCase() },
//     });
//     if (existingUser) return sendError(res, 409, "Email already registered");

//     const hashedPassword = await bcrypt.hash(password, 10);
//     let approval_status =
//       role === "admin" || role === "teacher" ? "approved" : "pending";

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role,
//       subject: role === "student" ? subject : null,
//       approval_status,
//     });

//     let token = null;
//     if (approval_status === "approved") {
//       token = generateToken(user);
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
//     if (!email || !password) {
//       return sendError(res, 400, "Email and password required");
//     }

//     const user = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (!user) return sendError(res, 401, "Invalid email or password");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid email or password");

//     if (
//       user.role.toLowerCase() === "student" &&
//       user.approval_status !== "approved"
//     ) {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const token = generateToken(user);

//     user.lastLogin = new Date();
//     await user.save();

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
//       "Login successful"
//     );
//   } catch (err) {
//     return sendError(res, 500, "Server error during login", err.message);
//   }
// };

// // ================================
// // 🔹 Current User (me)
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




const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/response");

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
        },
      },
      "Login successful"
    );
  } catch (error) {
    return sendError(res, 500, "Login failed", error.message);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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