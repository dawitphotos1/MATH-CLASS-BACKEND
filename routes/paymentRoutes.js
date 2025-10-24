// routes/paymentRoutes.js
import express from "express";
import {
  getPaymentByCourseId,
  createCheckoutSession,
  confirmPayment,
  handleStripeWebhook,
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💳 PAYMENT ROUTES (Math Class Platform)
============================================================ */

/**
 * Get course info for payment page
 * Used by PaymentPage.jsx to display course details before checkout
 */
router.get("/:id", authenticateToken, getPaymentByCourseId);

/**
 * Create Stripe checkout session
 */
router.post("/create-session", authenticateToken, createCheckoutSession);
router.post("/create-checkout-session", authenticateToken, createCheckoutSession); // alias

/**
 * Confirm payment (from frontend fallback)
 */
router.post("/confirm", authenticateToken, confirmPayment);
router.post("/confirm-payment", authenticateToken, confirmPayment); // alias

/**
 * Stripe Webhook (⚠️ RAW body required)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
