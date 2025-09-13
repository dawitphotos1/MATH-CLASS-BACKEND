// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Helper to sign tokens
const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Students require approval, admins/teachers are auto-approved
    let approvalStatus = role === "student" ? "pending" : "approved";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "student" ? subject : null,
      approval_status: approvalStatus,
    });

    console.log("✅ New user registered:", {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
    });

    let token = null;
    if (approvalStatus === "approved") {
      token = generateToken(user);
    }

    return res.status(201).json({
      message:
        approvalStatus === "pending"
          ? "Registration successful (pending approval)."
          : "Registration successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.role === "student" && user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account pending approval" });
    }

    const token = generateToken(user);

    user.lastLogin = new Date();
    await user.save();

    console.log("✅ User logged in:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error during login" });
  }
};

// @desc    Get current user (from token)
// @route   GET /api/v1/auth/me
// @access  Private
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("❌ Me route error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error fetching user data" });
  }
};

// @desc    Approve or reject a student
// @route   PUT /api/v1/auth/students/:studentId/approval
// @access  Private/Admin
const approveStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!studentId || !action) {
      return res.status(400).json({ error: "Student ID and action required" });
    }

    const user = await User.findByPk(studentId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    if (action === "approve") {
      user.approval_status = "approved";
    } else if (action === "reject") {
      user.approval_status = "rejected";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await user.save();

    return res.json({
      message: `Student ${action}d successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approval_status: user.approval_status,
      },
    });
  } catch (err) {
    console.error("❌ Approve student error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error updating student" });
  }
};

module.exports = {
  register,
  login,
  me,
  approveStudent,
};
