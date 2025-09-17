// // routes/auth.js
// const express = require("express");
// const authController = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
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

// // 🔹 Current User (me) → requires valid token
// router.get("/me", authMiddleware, authController.me);

// module.exports = router;




// routes/auth.js
const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidator");

const router = express.Router();

// 🔹 Register
router.post(
  "/register",
  registerValidation,
  validateRequest,
  authController.register
);

// 🔹 Login
router.post(
  "/login",
  loginValidation,
  validateRequest,
  authController.login
);

// 🔹 Current User (protected route)
router.get("/me", authenticateToken, authController.me);

module.exports = router;
