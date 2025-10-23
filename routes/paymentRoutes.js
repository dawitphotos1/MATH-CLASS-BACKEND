// // routes/paymentRoutes.js
// import express from "express";
// import {
//   getPaymentByCourseId,
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
//  * 1️⃣ Get course info for payment page
//  *    Used by PaymentPage.jsx to display course details before checkout
//  */
// router.get("/:id", authenticateToken, getPaymentByCourseId);

// /**
//  * 2️⃣ Create Stripe checkout session
//  *    Creates a secure Stripe Checkout session and returns a sessionId + URL
//  */
// router.post("/create-session", authenticateToken, createCheckoutSession);

// // ✅ Alias for compatibility with frontend older naming
// router.post(
//   "/create-checkout-session",
//   authenticateToken,
//   createCheckoutSession
// );

// /**
//  * 3️⃣ Confirm payment (from frontend fallback or success redirect)
//  */
// router.post("/confirm", authenticateToken, confirmPayment);
// router.post("/confirm-payment", authenticateToken, confirmPayment); // ✅ Alias for redundancy

// /**
//  * 4️⃣ Stripe Webhook — used directly by Stripe after successful payments
//  * ⚠️ Important: Stripe requires raw request body for signature verification
//  */
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// export default router;





import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import { protect } from "../middleware/authMiddleware.js"; // optional: only allow logged-in users

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31",
});

/* =========================================================
   🎯 Create Stripe Checkout Session
========================================================= */
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "Course ID is required" });
    }

    // 🧩 Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const priceInCents = Math.round(Number(course.price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid course price" });
    }

    // 🧠 Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description?.slice(0, 120) || "Course Enrollment",
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        courseId: course._id.toString(),
        courseTitle: course.title,
      },
      customer_email: req.user?.email || undefined, // optional
    });

    console.log("✅ Stripe checkout session created:", session.id);

    res.json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error("❌ Stripe session error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to create checkout session",
    });
  }
});

export default router;
