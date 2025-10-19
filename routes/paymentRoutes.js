
// // routes/paymentRoutes.js
// import express from "express";
// import {
//   getCourseForPayment,
//   createCheckoutSession,
//   confirmPayment,
//   handleStripeWebhook,
// } from "../controllers/paymentController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ============================================================
//    💳 PAYMENT ROUTES (Math Class Platform)
// ============================================================ */

// /**
//  * 1️⃣ Get course info for the payment page
//  * Used by PaymentPage.jsx to display course details before checkout
//  */
// router.get("/:id", authenticateToken, getCourseForPayment);

// /**
//  * 2️⃣ Create Stripe checkout session
//  * Creates a secure Stripe Checkout session and returns a URL
//  */
// router.post("/create-session", authenticateToken, createCheckoutSession);

// // ✅ Alias for frontend compatibility (some older code may use this path)
// router.post(
//   "/create-checkout-session",
//   authenticateToken,
//   createCheckoutSession
// );

// /**
//  * 3️⃣ Confirm payment (from payment-success.html)
//  * Called after Stripe redirects the user back to success page
//  */
// router.post("/confirm", authenticateToken, confirmPayment);
// router.post("/confirm-payment", authenticateToken, confirmPayment); // ✅ Alias for redundancy

// /**
//  * 4️⃣ Stripe Webhook (Server-to-Server)
//  * Stripe calls this endpoint directly when a payment is completed.
//  * It must receive the raw request body to verify the event signature.
//  */
// router.post(
//   "/webhook",
//   // ⚠️ Important: Stripe requires the *raw* request body for signature verification.
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// export default router;




// routes/paymentRoutes.js
import express from "express";
import {
  getCourseForPayment,
  createCheckoutSession,
  confirmPayment,
  handleStripeWebhook,
  testStripeConnection, // Add this import
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💳 PAYMENT ROUTES (Math Class Platform)
============================================================ */

/**
 * 🧪 DEBUG: Test Stripe connection
 * GET /api/v1/payments/debug/stripe
 */
router.get("/debug/stripe", authenticateToken, testStripeConnection);

/**
 * 1️⃣ Get course info for the payment page
 * GET /api/v1/payments/:id
 */
router.get("/:id", authenticateToken, getCourseForPayment);

/**
 * 2️⃣ Create Stripe checkout session
 * POST /api/v1/payments/create-checkout-session
 */
router.post("/create-checkout-session", authenticateToken, createCheckoutSession);

// ✅ Alias for compatibility
router.post("/create-session", authenticateToken, createCheckoutSession);

/**
 * 3️⃣ Confirm payment (from payment-success.html)
 * POST /api/v1/payments/confirm
 */
router.post("/confirm", authenticateToken, confirmPayment);

// ✅ Alias for redundancy
router.post("/confirm-payment", authenticateToken, confirmPayment);

/**
 * 4️⃣ Stripe Webhook (Server-to-Server)
 * POST /api/v1/payments/webhook
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;