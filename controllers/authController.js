// // controllers/authController.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

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

//     // Check if user exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already in use" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Approval logic
//     let approvalStatus = "pending";
//     if (role === "teacher" || role === "admin") {
//       approvalStatus = "approved";
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       subject: subject || null,
//       approvalStatus,
//     });

//     // If teacher/admin, return token for auto-login
//     if (role === "teacher" || role === "admin") {
//       const token = generateToken(user);
//       return res.status(201).json({
//         message: "Registration successful",
//         user,
//         token,
//       });
//     }

//     // Students only get user object
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

//     // Check user
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Students must be approved
//     if (user.role === "student" && user.approvalStatus !== "approved") {
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






// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Approval logic
    let approvalStatus = "pending";
    if (role === "teacher" || role === "admin") {
      approvalStatus = "approved";
    }

    // Create user (use correct column name: approval_status)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      subject: subject || null,
      approval_status: approvalStatus,
    });

    // If teacher/admin, return token for auto-login
    if (role === "teacher" || role === "admin") {
      const token = generateToken(user);
      return res.status(201).json({
        message: "Registration successful",
        user,
        token,
      });
    }

    // Students only get user object
    return res.status(201).json({
      message: "Registration successful (pending approval)",
      user,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Students must be approved
    if (user.role === "student" && user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account pending admin approval" });
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
};
