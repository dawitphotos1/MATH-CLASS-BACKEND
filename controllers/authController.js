
// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../models/index.js"; // ✅ Use centralized model index

const { User } = db;

// =========================
// 🔑 Helper: Generate JWT
// =========================
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// 🔹 Register
// =========================
export const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
      subject: subject || null,
      approval_status: role === "student" ? "pending" : "approved",
    });

    // Auto-login only if approved
    if (user.approval_status === "approved") {
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res.status(201).json({
      success: true,
      message: user.approval_status === "approved"
        ? "Registration successful"
        : "Registration pending approval",
      user,
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// =========================
// 🔹 Login
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (user.approval_status !== "approved") {
      return res.status(403).json({ success: false, error: "Account pending approval" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// =========================
// 🔹 Get Current User
// =========================
export const getMe = async (req, res) => {
  try {
    console.log("🔍 Incoming cookies:", req.cookies);

    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    return res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("❌ getMe error:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// =========================
// 🔹 Logout
// =========================
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  return res.json({ success: true, message: "Logged out successfully" });
};
