// // controllers/authController.js
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import db from "../models/index.js";

// const { User } = db;

// // =========================
// // 🔑 Helper: Generate JWT
// // =========================
// const generateToken = (user) => {
//   return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

// // ✅ Shared cookie options
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
// };

// // =========================
// // 🔹 Register
// // =========================
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Name, email and password are required",
//       });
//     }

//     const existingUser = await User.findOne({
//       where: { email: email.toLowerCase() },
//     });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         error: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: role || "student",
//       subject: subject || null,
//       approval_status: role === "student" ? "pending" : "approved",
//     });

//     let token = null;

//     // Auto-login only if approved
//     if (user.approval_status === "approved") {
//       token = generateToken(user);
//       res.cookie("token", token, cookieOptions);
//     }

//     return res.status(201).json({
//       success: true,
//       message:
//         user.approval_status === "approved"
//           ? "Registration successful"
//           : "Registration pending approval",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         subject: user.subject,
//         approval_status: user.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Register error:", err.stack || err.message);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // =========================
// // 🔹 Login
// // =========================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Email and password required" });
//     }

//     const user = await User.findOne({
//       where: { email: email.toLowerCase() },
//     });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Invalid credentials" });
//     }

//     if (user.approval_status !== "approved") {
//       return res
//         .status(403)
//         .json({ success: false, error: "Account pending approval" });
//     }

//     const token = generateToken(user);
//     res.cookie("token", token, cookieOptions);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         subject: user.subject,
//         approval_status: user.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err.stack || err.message);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // =========================
// // 🔹 Get Current User
// // =========================
// export const getMe = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Not authenticated" });
//     }

//     const user = await User.findByPk(req.user.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(404).json({ success: false, error: "User not found" });
//     }

//     return res.json({ success: true, user });
//   } catch (err) {
//     console.error("❌ getMe error:", err.stack || err.message);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // =========================
// // 🔹 Logout
// // =========================
// export const logout = (req, res) => {
//   try {
//     res.clearCookie("token", cookieOptions);
//     return res.json({ success: true, message: "Logged out successfully" });
//   } catch (err) {
//     console.error("❌ Logout error:", err.stack || err.message);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };



// controllers/authController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { User } = db;

/* ============================================================
   🔑 Helper: Generate JWT
============================================================ */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/* ============================================================
   📝 Register
============================================================ */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "student",
      subject: subject || null,
      approval_status: role === "student" ? "pending" : "approved",
    });

    let token = null;
    if (user.approval_status === "approved") {
      token = generateToken(user);
      res.cookie("token", token, cookieOptions);
    }

    res.status(201).json({
      success: true,
      message:
        user.approval_status === "approved"
          ? "Registration successful"
          : "Registration pending approval",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approval_status: user.approval_status,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================================================
   🔐 Login
============================================================ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, error: "Email and password required" });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    if (user.approval_status !== "approved")
      return res
        .status(403)
        .json({ success: false, error: "Account pending approval" });

    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approval_status: user.approval_status,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================================================
   👤 Get Current User
============================================================ */
export const getMe = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ============================================================
   🚪 Logout
============================================================ */
export const logout = (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
