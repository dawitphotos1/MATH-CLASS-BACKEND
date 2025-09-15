
// const express = require("express");
// const authController = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
// const validateRequest = require("../middleware/validateRequest");
// const {
//   registerValidation,
//   loginValidation,
// } = require("../validators/authValidator");

// const router = express.Router();

// router.post(
//   "/register",
//   registerValidation,
//   validateRequest,
//   authController.register
// );
// router.post("/login", loginValidation, validateRequest, authController.login);
// router.get("/me", authMiddleware, authController.me);

// module.exports = router;




// routes/auth.js
const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
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
router.post("/login", loginValidation, validateRequest, authController.login);

// 🔹 Current User (me)
router.get("/me", authMiddleware, authController.me);

module.exports = router;
