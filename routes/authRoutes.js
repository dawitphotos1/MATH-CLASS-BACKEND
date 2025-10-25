// // routes/authRoutes.js
// import express from "express";
// import {
//   register,
//   login,
//   getMe,
//   logout,
// } from "../controllers/authController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ============================================================
//    👤 Auth Routes
// ============================================================ */

// // 📝 Register a new user
// router.post("/register", register);

// // 🔑 Login (returns JWT + cookie)
// router.post("/login", login);

// // 🙋‍♂️ Get current logged-in user
// router.get("/me", authenticateToken, getMe);

// // 🚪 Logout user (clears cookie)
// router.post("/logout", logout);

// export default router;





// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  confirmAccount, // ✅ new controller
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   👤 Auth Routes
============================================================ */

// 📝 Register a new user
router.post("/register", register);

// 🔑 Login (returns JWT + cookie)
router.post("/login", login);

// 🙋‍♂️ Get current logged-in user
router.get("/me", authenticateToken, getMe);

// 🚪 Logout user (clears cookie)
router.post("/logout", logout);

// ✅ Confirm account (email verification link)
router.get("/confirm-account", confirmAccount);

export default router;
