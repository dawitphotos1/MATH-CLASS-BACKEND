//routes/payments.js
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  createCheckoutSession,
  confirmPayment,
} from "../controllers/paymentController.js";
import db from "../models/index.js";

const router = express.Router();
const { Course } = db;

// ✅ Stripe Checkout
router.post(
  "/create-checkout-session",
  authenticateToken,
  createCheckoutSession
);

// ✅ Confirm Payment
router.post("/confirm", authenticateToken, confirmPayment);

// ✅ Course Info (used by frontend PaymentSuccess)
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: parseFloat(course.price),
        slug: course.slug,
      },
    });
  } catch (err) {
    console.error("❌ Course fetch error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch course" });
  }
});

export default router;
