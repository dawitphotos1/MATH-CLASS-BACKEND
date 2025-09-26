
// import express from "express";
// import { register, login, me, logout } from "../controllers/authController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", authMiddleware, me);
// router.post("/logout", logout);

// export default router;



import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

export default router;
