
// // backend/routes/auth.js
// const express = require("express");
// const authController = require("../controllers/authController");
// const auth = require("../middleware/auth"); // middleware to protect routes

// const router = express.Router();

// // 🔹 Public routes
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// // 🔹 Protected routes
// router.get("/me", auth, authController.me);

// // 🔹 Admin-only route (approve/reject students)
// router.put(
//   "/students/:studentId/approval",
//   auth, // requires logged-in admin
//   authController.approveStudent
// );

// module.exports = router;




// backend/routes/auth.js
const express = require("express");
const authController = require("../controllers/authController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

// 🔹 Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// 🔹 Protected route: get current user
router.get("/me", authMiddleware, authController.me);

// 🔹 Admin-only route: approve/reject students
router.put(
  "/students/:studentId/approval",
  authMiddleware,
  adminOnly,
  authController.approveStudent
);

module.exports = router;
