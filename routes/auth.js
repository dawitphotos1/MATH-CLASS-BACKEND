
// // routes/auth.js
// import express from "express";
// import {
//   register,
//   login,
//   logout,
//   getMe,
// } from "../controllers/authController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // User registration
// router.post("/register", register);

// // User login
// router.post("/login", login);

// // Get current logged-in user
// router.get("/me", authenticateToken, getMe);

// // Logout user
// router.post("/logout", logout);

// export default router;




import express from "express";
import { register, login, me, logout } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // ✅ default import

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

export default router;
