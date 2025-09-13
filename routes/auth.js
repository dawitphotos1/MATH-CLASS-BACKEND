
// File: backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const authController = require("../controllers/authController");

const router = express.Router();

// 🔹 Register route (public)
router.post("/register", authController.register);

// 🔹 Login route (public)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    if (user.approval_status === "pending") {
      return res.status(403).json({ success: false, error: "Your account is awaiting approval" });
    }
    if (user.approval_status === "rejected") {
      return res.status(403).json({ success: false, error: "Your account has been rejected" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await user.update({ lastLogin: new Date() });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Login failed", details: err.message });
  }
});

module.exports = router;
