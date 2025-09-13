// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// // Import named exports using destructuring!
// const { authMiddleware, adminOnly } = require("../middleware/auth");

// // Public routes
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// // Protected routes
// router.get("/me", authMiddleware, authController.me);

// // Admin-only approval route
// router.post(
//   "/approve/:studentId",
//   authMiddleware,
//   adminOnly,
//   authController.approveStudent
// );

// module.exports = router;




// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ✅ Import middleware
const { authMiddleware, adminOnly } = require("../middleware/auth");

// ================================
// 🔹 Public Routes
// ================================
router.post("/register", authController.register);
router.post("/login", authController.login);

// ================================
// 🔹 Protected Routes
// ================================
router.get("/me", authMiddleware, authController.me);

// ================================
// 🔹 Admin-only Routes (optional)
// ================================
// If you want admins to approve/reject directly here
// But normally we keep this in adminRoutes.js
if (authController.approveStudent) {
  router.post(
    "/approve/:studentId",
    authMiddleware,
    adminOnly,
    authController.approveStudent
  );
}

module.exports = router;
