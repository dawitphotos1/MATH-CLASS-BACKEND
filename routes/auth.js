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
const { login, register, me, logout } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// ✅ TEST route to confirm deployment
router.get("/test", (req, res) => {
  res.json({ success: true, message: "✅ Auth routes are working!" });
});

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", authenticateToken, me);

module.exports = router;
