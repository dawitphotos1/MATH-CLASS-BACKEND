// Mathe-Class-Website-Backend/routes/paymentRoutes.js
import express from "express";
import {
  createCheckoutSession,
  confirmPayment,
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💳 Stripe Payment Routes
============================================================ */

// ✅ Create Stripe checkout session
router.post(
  "/create-checkout-session",
  authenticateToken,
  createCheckoutSession
);

// ✅ Confirm payment after success
router.post("/confirm-payment", authenticateToken, confirmPayment);

// ✅ Backward-compatible aliases (optional)
router.post("/create-session", authenticateToken, createCheckoutSession);
router.post("/confirm", authenticateToken, confirmPayment);

export default router;
