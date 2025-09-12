// const express = require("express");
// const router = express.Router();
// const { register, login } = require("../controllers/authController");

// // @route   POST /api/v1/auth/register
// // @desc    Register a new user
// // @access  Public
// router.post("/register", register);

// // @route   POST /api/v1/auth/login
// // @desc    Login user and return token
// // @access  Public
// router.post("/login", login);

// module.exports = router;




const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // for /me

// ================================
// 🔹 Auth Routes
// ================================
router.post("/register", authController.register); // Register new user
router.post("/login", authController.login); // Login user
router.get("/me", authMiddleware, authController.me); // Get current user

module.exports = router;
