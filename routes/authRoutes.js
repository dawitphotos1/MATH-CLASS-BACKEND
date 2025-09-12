// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware"); // for /me

// // ================================
// // 🔹 Auth Routes
// // ================================
// router.post("/register", authController.register); // Register new user
// router.post("/login", authController.login); // Login user
// router.get("/me", authMiddleware, authController.me); // Get current user

// module.exports = router;


const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Import named exports using destructuring!
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.me);

// Admin-only approval route
router.post(
  "/approve/:studentId",
  authMiddleware,
  adminOnly,
  authController.approveStudent
);

module.exports = router;
