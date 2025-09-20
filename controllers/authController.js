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
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (existingUser) {
//       return sendError(res, 400, "User with this email already exists");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: role.toLowerCase(),
//       approval_status: role === "student" ? "pending" : "approved",
//       subject: subject || null,
//       avatar: null,
//     });

//     // Only send token if user is approved
//     let token = null;
//     if (user.approval_status === "approved") {
//       token = jwt.sign(
//         { userId: user.id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" } // Increased to 7 days
//       );
//     }

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
//           avatar: user.avatar,
//         },
//       },
//       user.approval_status === "approved"
//         ? "Registration successful"
//         : "Registration pending approval"
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
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
//       { expiresIn: "7d" } // Increased to 7 days
//     );

//     // Update last login
//     await user.update({ last_login: new Date() });

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
//           avatar: user.avatar,
//           last_login: user.last_login,
//         },
//       },
//       "Login successful"
//     );
//   } catch (error) {
//     console.error("Login error:", error);
//     return sendError(res, 500, "Login failed", error.message);
//   }
// };

// // =========================
// // 🔹 Me (get current user)
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
//         "avatar",
//         "last_login",
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
//         avatar: user.avatar,
//         last_login: user.last_login,
//       },
//     });
//   } catch (err) {
//     console.error("Me endpoint error:", err);
//     return sendError(res, 500, "Failed to fetch user profile", err.message);
//   }
// };




// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// @desc    Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    // Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 🔥 important for Render (HTTPS)
      sameSite: "none", // 🔥 allow cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged in user
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
};
