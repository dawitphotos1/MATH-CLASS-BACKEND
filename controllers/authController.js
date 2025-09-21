
// // controllers/authController.js
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import db from "../models/index.js"; // ✅ use default import
// const { User } = db;                 // ✅ destructure User from db
// import { sendSuccess, sendError } from "../utils/response.js";

// // =========================
// // 🔐 Generate JWT Token
// // =========================
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// // =========================
// // 🔹 Register
// // =========================
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

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

//     let token = null;
//     if (user.approval_status === "approved") {
//       token = generateToken(user);

//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "None",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       });
//     }

//     return sendSuccess(
//       res,
//       { user },
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
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (!user) return sendError(res, 401, "Invalid credentials");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid credentials");

//     if (user.approval_status !== "approved") {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const token = generateToken(user);
//     await user.update({ last_login: new Date() });

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "None",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return sendSuccess(
//       res,
//       { user, token },
//       "Login successful"
//     );
//   } catch (error) {
//     console.error("Login error:", error);
//     return sendError(res, 500, "Login failed", error.message);
//   }
// };

// // =========================
// // 🔹 Get Current User
// // =========================
// export const getMe = async (req, res) => {
//   try {
//     if (!req.user) return sendError(res, 404, "User not found");
//     return sendSuccess(res, { user: req.user });
//   } catch (err) {
//     console.error("Me endpoint error:", err);
//     return sendError(res, 500, "Failed to fetch user profile", err.message);
//   }
// };

// // =========================
// // 🔹 Logout
// // =========================
// export const logout = (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "None",
//   });
//   return res.status(200).json({ success: true, message: "Logged out successfully" });
// };



// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// @desc   Register a new user
// @route  POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "student",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Login user
// @route  POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user);

    // 👇 Cookie options: dev vs prod
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("✅ Login successful, cookie set");
    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current logged in user
// @route  GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    console.log("🔍 Incoming cookies:", req.cookies);

    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc   Logout (clear cookie)
// @route  POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    console.log("✅ Cookie cleared, user logged out");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
