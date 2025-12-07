
// routes/paymentRoutes.js
import express from "express";
import {
  getPaymentByCourseId,
  createCheckoutSession,
  confirmPayment,
  handleStripeWebhook,
} from "../controllers/paymentController.js";
import {authenticateToken} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💳 PAYMENT ROUTES (Math Class Platform)
============================================================ */

/**
 * @route   GET /api/payments/:id
 * @desc    Get course info for payment page
 * @access  Private (Authenticated users)
 */
router.get("/:id", authenticateToken, getPaymentByCourseId);

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe checkout session
 * @access  Private (Students only)
 */
router.post("/create-checkout-session", authenticateToken, createCheckoutSession);

// Legacy route for backward compatibility
router.post("/create-session", authenticateToken, createCheckoutSession);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment (frontend fallback)
 * @access  Private (Students only)
 */
router.post("/confirm", authenticateToken, confirmPayment);

// Legacy route for backward compatibility
router.post("/confirm-payment", authenticateToken, confirmPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe Webhook endpoint (RAW body required)
 * @access  Public (Called by Stripe)
 * @note    This route MUST use express.raw() middleware
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;