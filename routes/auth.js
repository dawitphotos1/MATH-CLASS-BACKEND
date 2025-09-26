
// // routes/auth.js
// import express from "express";
// import {
//   register,
//   login,
//   getMe,
//   logout,
// } from "../controllers/authController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Register
// router.post("/register", register);

// // Login
// router.post("/login", login);

// // Get current logged-in user
// router.get("/me", authenticateToken, getMe);

// // Logout
// router.post("/logout", logout);

// export default router;




// routes/auth.js
import express from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);   // ✅ changed
router.post("/logout", logout);

export default router;
