//routes/paymentRoutes.js
import express from "express";
import {
  confirmPayment,
  createCheckoutSession,
  getCourseForPayment,
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💰 Payment Routes
============================================================ */

// Create Stripe checkout session
router.post("/create-session", authenticateToken, createCheckoutSession);

// ✅ Add this alias for frontend compatibility
router.post(
  "/create-checkout-session",
  authenticateToken,
  createCheckoutSession
);

// Confirm payment (after checkout success)
router.post("/confirm", authenticateToken, confirmPayment);
router.post("/confirm-payment", authenticateToken, confirmPayment); // ✅ Keep alias

// Fetch course info for payment display
router.get("/:id", authenticateToken, getCourseForPayment);

export default router;