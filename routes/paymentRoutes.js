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
 * 1️⃣ Get course info for payment page
 *    Used by PaymentPage.jsx to display course details before checkout
 */
router.get("/:id", authenticateToken, getPaymentByCourseId);

/**
 * 2️⃣ Create Stripe checkout session
 *    Creates a secure Stripe Checkout session and returns a sessionId + URL
 */
router.post("/create-session", authenticateToken, createCheckoutSession);

// ✅ Alias for compatibility with frontend older naming
router.post(
  "/create-checkout-session",
  authenticateToken,
  createCheckoutSession
);

/**
 * 3️⃣ Confirm payment (from frontend fallback or success redirect)
 */
router.post("/confirm", authenticateToken, confirmPayment);
router.post("/confirm-payment", authenticateToken, confirmPayment); // ✅ Alias for redundancy

/**
 * 4️⃣ Stripe Webhook — used directly by Stripe after successful payments
 * ⚠️ Important: Stripe requires raw request body for signature verification
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
