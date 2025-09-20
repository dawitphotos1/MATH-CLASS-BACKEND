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
