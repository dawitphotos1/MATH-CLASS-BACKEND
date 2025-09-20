
// routes/auth.js
import express from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

// Get current logged-in user
router.get("/me", authenticateToken, getMe);

// Logout user
router.post("/logout", logout);

export default router;
