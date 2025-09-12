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
const authMiddleware = require("../middleware/authMiddleware");

// ================================
// 🔹 Auth Routes
// ================================
router.post("/register", authController.register); // Register new user
router.post("/login", authController.login); // Login user
router.get("/me", authMiddleware, authController.me); // Get current user
router.post(
  "/approve/:studentId",
  authMiddleware,
  authController.approveStudent
); // Admin approval

module.exports = router;
