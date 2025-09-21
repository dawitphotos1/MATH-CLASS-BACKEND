
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
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

// Helper: sign JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔹 Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject,
      approval_status: role === "admin" ? "approved" : "pending",
    });

    // Auto-login only if approved
    if (user.approval_status === "approved") {
      const token = generateToken(user.id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account not approved yet" });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Get logged-in user
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    return res.json({ user: req.user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Logout
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
};
