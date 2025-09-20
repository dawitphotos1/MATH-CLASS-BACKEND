// // routes/auth.js
// const express = require("express");
// const authController = require("../controllers/authController");
// const { authenticateToken } = require("../middleware/authMiddleware");
// const validateRequest = require("../middleware/validateRequest");
// const {
//   registerValidation,
//   loginValidation,
// } = require("../validators/authValidator");

// const router = express.Router();

// // 🔹 Register
// router.post(
//   "/register",
//   registerValidation,
//   validateRequest,
//   authController.register
// );

// // 🔹 Login
// router.post("/login", loginValidation, validateRequest, authController.login);

// // 🔹 Current User (protected route)
// router.get("/me", authenticateToken, authController.me);

// module.exports = router;


// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login, me, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Get current logged-in user
router.get("/me", authenticateToken, me);

// Logout user (optional but useful)
router.post("/logout", logout);

module.exports = router;
