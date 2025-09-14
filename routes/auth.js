// // File: backend/routes/auth.js

// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const router = express.Router();

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Input validation
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Email and password are required" });
//     }

//     // Find user (case-insensitive)
//     console.log("Attempting to find user with email:", email);
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       console.log("User not found for email:", email);
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password. Please try again",
//       });
//     }

//     // Compare password
//     console.log("User found:", user.email, "Comparing passwords...");
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log("Password mismatch for user:", user.email);
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password. Please try again",
//       });
//     }

//     // Check approval status
//     if (user.approvalStatus === "pending") {
//       console.log("User pending approval:", user.email, user.approvalStatus);
//       return res
//         .status(403)
//         .json({ success: false, error: "Your account is awaiting approval" });
//     }
//     if (user.approvalStatus === "rejected") {
//       console.log("User rejected:", user.email, user.approvalStatus);
//       return res
//         .status(403)
//         .json({ success: false, error: "Your account has been rejected" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user.id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Update last login
//     await user.update({ lastLogin: new Date() });

//     console.log("Login successful for user:", user.email);
//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approvalStatus: user.approvalStatus,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Login failed",
//       details: err.message,
//     });
//   }
// });

// module.exports = router;



const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/v1/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log("Auth/login: Missing email or password", { email });
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    // Find user (case-insensitive)
    console.log("Auth/login: Attempting to find user", { email });
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      console.log("Auth/login: User not found", { email });
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please try again",
      });
    }

    // Compare password
    console.log("Auth/login: Comparing passwords for", { email: user.email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Auth/login: Password mismatch", { email: user.email });
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please try again",
      });
    }

    // Check approval status
    if (user.approval_status === "pending") {
      console.log("Auth/login: User pending approval", {
        email: user.email,
        approval_status: user.approval_status,
      });
      return res
        .status(403)
        .json({ success: false, error: "Your account is awaiting approval" });
    }
    if (user.approval_status === "rejected") {
      console.log("Auth/login: User rejected", {
        email: user.email,
        approval_status: user.approval_status,
      });
      return res
        .status(403)
        .json({ success: false, error: "Your account has been rejected" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    await user.update({ lastLogin: new Date() });

    console.log("Auth/login: Login successful", {
      email: user.email,
      role: user.role,
    });
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
    console.error("Auth/login: Error", {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: err.message,
    });
  }
});

// GET /api/v1/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "name", "email", "role", "approval_status", "subject"],
    });
    if (!user) {
      console.log("Auth/me: User not found", { userId: req.user.userId });
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.log("Auth/me: User fetched successfully", {
      email: user.email,
      role: user.role,
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
        subject: user.subject,
      },
    });
  } catch (err) {
    console.error("Auth/me: Error", { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;