// // controllers/authController.js
// const { User } = require("../models");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { sendSuccess, sendError } = require("../utils/response");

// // =========================
// // 🔹 Register
// // =========================
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, subject } = req.body;
    
//     // Check if user already exists
//     const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
//     if (existingUser) {
//       return sendError(res, 400, "User with this email already exists");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: role.toLowerCase(),
//       approval_status: role === "student" ? "pending" : "approved",
//       subject: subject || null,
//       avatar: null,
//     });

//     // Only send token if user is approved
//     let token = null;
//     if (user.approval_status === "approved") {
//       token = jwt.sign(
//         { userId: user.id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" } // Increased to 7 days
//       );
//     }

//     return sendSuccess(
//       res,
//       {
//         token,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           approval_status: user.approval_status,
//           subject: user.subject,
//           avatar: user.avatar,
//         },
//       },
//       user.approval_status === "approved"
//         ? "Registration successful"
//         : "Registration pending approval"
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
//     return sendError(res, 500, "Registration failed", error.message);
//   }
// };

// // =========================
// // 🔹 Login
// // =========================
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email: email.toLowerCase() } });

//     if (!user) return sendError(res, 401, "Invalid credentials");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return sendError(res, 401, "Invalid credentials");

//     if (user.approval_status !== "approved") {
//       return sendError(res, 403, "Account pending approval");
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" } // Increased to 7 days
//     );

//     // Update last login
//     await user.update({ last_login: new Date() });

//     return sendSuccess(
//       res,
//       {
//         token,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           approval_status: user.approval_status,
//           subject: user.subject,
//           avatar: user.avatar,
//           last_login: user.last_login,
//         },
//       },
//       "Login successful"
//     );
//   } catch (error) {
//     console.error("Login error:", error);
//     return sendError(res, 500, "Login failed", error.message);
//   }
// };

// // =========================
// // 🔹 Me (get current user)
// // =========================
// exports.me = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.userId, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "approval_status",
//         "subject",
//         "avatar",
//         "last_login",
//       ],
//     });

//     if (!user) return sendError(res, 404, "User not found");

//     return sendSuccess(res, {
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role.toLowerCase(),
//         approval_status: user.approval_status,
//         subject: user.subject,
//         avatar: user.avatar,
//         last_login: user.last_login,
//       },
//     });
//   } catch (err) {
//     console.error("Me endpoint error:", err);
//     return sendError(res, 500, "Failed to fetch user profile", err.message);
//   }
// };




// controllers/authController.js
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendSuccess, sendError } = require("../utils/response");

// =========================
// 🔹 Register
// =========================
exports.register = async (req, res) => {
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

    // Set cookie only if approved
    if (user.approval_status === "approved") {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

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
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) return sendError(res, 401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    if (user.approval_status !== "approved") {
      return sendError(res, 403, "Account pending approval");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await user.update({ last_login: new Date() });

    // ✅ Set HttpOnly cookie
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
// 🔹 Logout
// =========================
exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return sendSuccess(res, {}, "Logout successful");
};

// =========================
// 🔹 Me (get current user)
// =========================
exports.me = async (req, res) => {
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
      user,
    });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return sendError(res, 500, "Failed to fetch user profile", err.message);
  }
};
