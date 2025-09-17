
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
// router.post(
//   "/login",
//   loginValidation,
//   validateRequest,
//   authController.login
// );

// // 🔹 Current User (protected route)
// router.get("/me", authenticateToken, authController.me);

// module.exports = router;





// routes/auth.js - TEMPORARY DIAGNOSTIC VERSION
const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Register
router.post("/register", authController.register);

// 🔹 Login
router.post("/login", authController.login);

// 🔹 Current User (protected route)
router.get("/me", authenticateToken, authController.me);

// 🔹 COMMENT OUT EVERYTHING ELSE TEMPORARILY
/*
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

router.post("/forgot-password", (req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});

router.post("/reset-password", (req, res) => {
  res.status(501).json({ success: false, error: "Not implemented" });
});
*/

module.exports = router;