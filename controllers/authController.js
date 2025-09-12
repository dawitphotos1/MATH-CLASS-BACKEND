// // controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // 🔑 Token generator
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// // ✅ REGISTER
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;

//     // Check if email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already in use" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Business rule: only students need approval
//     let approvalStatus = role === "student" ? "pending" : "approved";

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: subject || null,
//       approval_status: approvalStatus,
//     });

//     // ✅ If teacher/admin, return token for auto-login
//     if (role === "teacher" || role === "admin") {
//       const token = generateToken(user);
//       return res.status(201).json({
//         message: "Registration successful",
//         user,
//         token,
//       });
//     }

//     // ✅ Students don’t get token until approved
//     return res.status(201).json({
//       message: "Registration successful (pending approval)",
//       user,
//     });
//   } catch (err) {
//     console.error("❌ Register error:", err);
//     return res.status(500).json({ error: "Server error during registration" });
//   }
// };

// // ✅ LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // ✅ Students must be approved to log in
//     if (user.role === "student" && user.approval_status !== "approved") {
//       return res.status(403).json({ error: "Account pending admin approval" });
//     }

//     // Generate token
//     const token = generateToken(user);

//     return res.status(200).json({
//       message: "Login successful",
//       user,
//       token,
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     return res.status(500).json({ error: "Server error during login" });
//   }
// };




const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ================================
// 🔹 Register
// ================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role-based approval
    let approvalStatus = "pending"; // default for student
    if (role === "admin" || role === "teacher") {
      approvalStatus = "approved"; // ✅ auto-approve
    }

    // Save new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: role === "student" ? subject : null,
      approval_status: approvalStatus,
    });

    // Debug log
    console.log("✅ New user registered:", {
      id: user.id,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
    });

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
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// ================================
// 🔹 Login
// ================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check approval for students
    if (user.role === "student" && user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account pending approval" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log("✅ User logged in:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
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
    console.error("❌ Login error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error during login" });
  }
};

// ================================
// 🔹 Current User (me)
// ================================
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("❌ Me endpoint error:", err.message, err.stack);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
