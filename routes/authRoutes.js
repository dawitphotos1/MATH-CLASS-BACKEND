
// // backend/routes/authRoutes.js
// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// // ✅ Import middleware
// const { authMiddleware, adminOnly } = require("../middleware/auth");

// // ================================
// // 🔹 Public Routes
// // ================================
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// // ================================
// // 🔹 Protected Routes
// // ================================
// router.get("/me", authMiddleware, authController.me);

// // ================================
// // 🔹 Admin-only Routes (optional)
// // ================================
// // If you want admins to approve/reject directly here
// // But normally we keep this in adminRoutes.js
// if (authController.approveStudent) {
//   router.post(
//     "/approve/:studentId",
//     authMiddleware,
//     adminOnly,
//     authController.approveStudent
//   );
// }

// module.exports = router;



const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/login", login);
router.post("/register", register);

// Protected routes
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { User } = require("../models");
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "approval_status"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`✅ /auth/me: User fetched for ID ${req.user.id}`);
    res.json({ user });
  } catch (error) {
    console.error("❌ /auth/me error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;