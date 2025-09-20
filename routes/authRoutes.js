// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware"); // for /me

// // ================================
// // 🔹 Auth Routes
// // ================================
// router.post("/register", authController.register); // Register new user
// router.post("/login", authController.login); // Login user
// router.get("/me", authMiddleware, authController.me); // Get current user

// module.exports = router;



import express from "express";
import { register, login, me, logout } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

export default router;
