
// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // ✅ Fixed import
import { sendSuccess, sendError } from "../utils/response.js";

// =========================
// 🔐 Generate JWT Token
// =========================
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
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
      return sendError(res, 400, "User with this email already exists");
    }

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

    let token = null;
    if (user.approval_status === "approved") {
      token = generateToken(user);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return sendSuccess(
      res,
      {
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
    console.error("Registration error:", error);
    return sendError(res, 500, "Registration failed", error.message);
  }
};

// =========================
// 🔹 Login
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return sendError(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    if (user.approval_status !== "approved") {
      return sendError(res, 403, "Account pending approval");
    }

    const token = generateToken(user);

    await user.update({ last_login: new Date() });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approval_status: user.approval_status,
          subject: user.subject,
          avatar: user.avatar,
          last_login: user.last_login,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Login failed", error.message);
  }
};

// =========================
// 🔹 Get Current User
// =========================
export const getMe = async (req, res) => {
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
        "last_login",
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
        last_login: user.last_login,
      },
    });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return sendError(res, 500, "Failed to fetch user profile", err.message);
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
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};
