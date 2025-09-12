// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// // ================================
// // 🔹 Register
// // ================================
// exports.register = async (req, res) => {
//   try {
//     let { name, email, password, role, subject } = req.body;

//     if (!name || !email || !password || !role) {
//       return res
//         .status(400)
//         .json({ error: "All required fields must be filled" });
//     }

//     // Normalize role to lowercase
//     role = role.toLowerCase();

//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Role-based approval
//     let approvalStatus = "pending"; // default for student
//     if (role === "admin" || role === "teacher") {
//       approvalStatus = "approved"; // ✅ auto-approve
//     }

//     // Save new user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: role === "student" ? subject : null,
//       approval_status: approvalStatus,
//     });

//     // ✅ Generate token only if auto-approved
//     let token = null;
//     if (approvalStatus === "approved") {
//       token = jwt.sign(
//         { id: user.id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//       );
//     }

//     // Debug log
//     console.log("✅ New user registered:", {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       approval_status: user.approval_status,
//       tokenIssued: !!token,
//     });

//     return res.status(201).json({
//       message:
//         approvalStatus === "pending"
//           ? "Registration successful (pending approval)."
//           : "Registration successful.",
//       token, // ✅ only for admin/teacher
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approval_status: user.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Registration error:", err.message, err.stack);
//     return res.status(500).json({ error: "Server error during registration" });
//   }
// };

// // ================================
// // 🔹 Login
// // ================================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password required" });
//     }

//     // Find user
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // Students must be approved
//     if (user.role === "student" && user.approval_status !== "approved") {
//       return res.status(403).json({ error: "Account pending approval" });
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     console.log("✅ User logged in:", {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     });

//     return res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         approval_status: user.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err.message, err.stack);
//     return res.status(500).json({ error: "Server error during login" });
//   }
// };

// // ================================
// // 🔹 Current User (me)
// // ================================
// exports.me = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.json(user);
//   } catch (err) {
//     console.error("❌ Me endpoint error:", err.message, err.stack);
//     return res.status(500).json({ error: "Failed to fetch user profile" });
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

    // ================================
    // 🔑 Auto-login for teachers/admins
    // ================================
    let token = null;
    if (approvalStatus === "approved") {
      token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
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
      token, // ✅ only returned for teacher/admin
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message, err.stack);
    return res.status(500).json({ error: "Server error during registration" });
  }
};
