
// import express from "express";
// import { register, login, me, logout } from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", authMiddleware, me);
// router.post("/logout", logout);

// export default router;


// routes/authRoutes.js
import express from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/v1/auth/register
router.post("/register", register);

// @route   POST /api/v1/auth/login
router.post("/login", login);

// @route   GET /api/v1/auth/me (requires auth)
router.get("/me", authenticateToken, getMe);

// @route   POST /api/v1/auth/logout
router.post("/logout", logout);

export default router;
