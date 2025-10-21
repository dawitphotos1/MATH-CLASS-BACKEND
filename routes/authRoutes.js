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
// // POST /api/v1/auth/register
// router.post("/register", register);

// // 🔑 Login (returns JWT + cookie)
// // POST /api/v1/auth/login
// router.post("/login", login);

// // 🙋‍♂️ Get current logged-in user
// // GET /api/v1/auth/me
// router.get("/me", authenticateToken, async (req, res, next) => {
//   try {
//     await getMe(req, res, next);
//   } catch (err) {
//     console.error("⚠️ /auth/me error:", err.message);
//     res
//       .status(500)
//       .json({ success: false, error: "Unable to fetch current user" });
//   }
// });

// // 🚪 Logout user (clears cookie)
// // POST /api/v1/auth/logout
// router.post("/logout", logout);

// export default router;




// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  getMe,
  logout,
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

export default router;