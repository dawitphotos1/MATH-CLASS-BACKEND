const express = require("express");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Login failed: no user found");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Approval checks
    if (user.approvalStatus === "pending") {
      return res
        .status(403)
        .json({ error: "Your account is pending approval." });
    }
    if (user.approvalStatus === "rejected") {
      return res.status(403).json({ error: "Your account has been rejected." });
    }

    // Compare plaintext password to single-hashed value
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Login failed: wrong password");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Server error: missing JWT secret" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1h" }
    );

    console.log("Login successful for user ID:", user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subject: user.subject,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in", details: err.message });
  }
});

// Register Route
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role, subject } = req.body;
    name = name.trim();
    email = email.toLowerCase().trim();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    if ((role === "student" || role === "teacher") && !subject?.trim()) {
      return res
        .status(400)
        .json({ error: "Subject is required for this role" });
    }

    // Check existing user
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user with plaintext password; Sequelize's beforeCreate hook will hash once
    const user = await User.create({
      name,
      email,
      password, // <<-- leave as plaintext for the hook
      role,
      subject: role === "admin" ? null : subject.trim(),
      approvalStatus: role === "student" ? "pending" : "approved",
    });

    console.log("Registered new user ID:", user.id);
    res.json({
      message:
        role === "student"
          ? "Registration successful! Your account is pending approval."
          : "Registration successful!",
      userId: user.id,
    });
  } catch (err) {
    console.error("Register: Detailed error:", {
      message: err.message,
      stack: err.stack,
      errors: err.errors,
    });

    const validationErrors =
      err.errors?.map((e) => `${e.path}: ${e.message}`) || [];
    res.status(500).json({
      error: "Failed to register user",
      details: err.message,
      validationErrors,
    });
  }
});

// Instructors Route
router.get("/instructors", async (req, res) => {
  try {
    const instructors = await User.findAll({
      where: { role: "teacher", approvalStatus: "approved" },
      attributes: ["id", "name", "email", "subject"],
    });
    res.json({ instructors });
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch instructors", details: err.message });
  }
});

// Contact Route
router.post("/contact", async (req, res) => {
  try {
    const { instructorId, email, message } = req.body;
    res.json({ message: "Contact message sent successfully" });
  } catch (err) {
    console.error("Contact error:", err);
    res
      .status(500)
      .json({ error: "Failed to send contact message", details: err.message });
  }
});

const auth = require("../middleware/auth");

// Pending Users
router.get("/pending", auth, async (req, res) => {
  try {
    if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const pendingUsers = await User.findAll({
      where: { approvalStatus: "pending" },
      attributes: ["id", "name", "email", "role", "subject", "approvalStatus"],
    });

    res.json(pendingUsers);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

// Approve User
router.post("/approve/:id", auth, async (req, res) => {
  try {
    if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user || user.approvalStatus !== "pending") {
      return res.status(404).json({ error: "User not found or not pending" });
    }

    await user.update({ approvalStatus: "approved" });
    res.json({ message: "User approved" });
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ error: "Failed to approve user" });
  }
});

// Reject User
router.post("/reject/:id", auth, async (req, res) => {
  try {
    if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user || user.approvalStatus !== "pending") {
      return res.status(404).json({ error: "User not found or not pending" });
    }

    await user.update({ approvalStatus: "rejected" });
    res.json({ message: "User rejected" });
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({ error: "Failed to reject user" });
  }
});

// Token Verify
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "subject", "approvalStatus"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
