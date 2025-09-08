
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
//       return res
//         .status(401)
//         .json({
//           success: false,
//           error: "Invalid email or password. Please try again",
//         });
//     }

//     // Compare password
//     console.log("User found:", user.email, "Comparing passwords...");
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log("Password mismatch for user:", user.email);
//       return res
//         .status(401)
//         .json({
//           success: false,
//           error: "Invalid email or password. Please try again",
//         });
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





// File: backend/routes/auth.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();

/**
 * =========================
 *  🔐 POST /login
 * =========================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.approvalStatus === "pending") {
      return res.status(403).json({ error: "Your account is awaiting approval" });
    }
    if (user.approvalStatus === "rejected") {
      return res.status(403).json({ error: "Your account has been rejected" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await user.update({ lastLogin: new Date() });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
});

/**
 * =========================
 *  👤 POST /register
 * =========================
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role.toLowerCase(),
      subject: role === "teacher" || role === "student" ? subject?.trim() : null,
      approvalStatus: role === "student" ? "pending" : "approved",
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subject: newUser.subject,
        approvalStatus: newUser.approvalStatus,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

module.exports = router;
