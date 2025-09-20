

// import express from "express";
// import { register, login, me, logout } from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js"; // ✅ default import

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", authMiddleware, me);
// router.post("/logout", logout);

// export default router;





// routes/auth.js
import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Register new user
router.post("/register", register);

// 🔹 Login user
router.post("/login", login);

// 🔹 Get current logged-in user (protected)
router.get("/me", authenticateToken, getMe);

// 🔹 Logout (clear cookie)
router.post("/logout", logout);

export default router;
