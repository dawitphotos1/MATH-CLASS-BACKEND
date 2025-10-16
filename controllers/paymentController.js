// Mathe-Class-Website-Backend/controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User } = db;

/* ============================================================
   💳 Create Stripe Checkout Session
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    console.log("📦 Payment request received:", req.body);
    console.log("🔑 Stripe Key:", !!process.env.STRIPE_SECRET_KEY);
    console.log("🌍 FRONTEND_BASE_URL:", process.env.FRONTEND_BASE_URL);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: "Missing STRIPE_SECRET_KEY in environment variables",
      });
    }

    if (!process.env.FRONTEND_BASE_URL) {
      return res.status(500).json({
        success: false,
        error: "Missing FRONTEND_BASE_URL in environment variables",
      });
    }

    const { courseId } = req.body;
    const user = req.user;
    if (!courseId || !user?.id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing user or course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    // Prevent duplicate enrollments
    const existing = await Enrollment.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existing) {
      if (
        existing.payment_status === "paid" &&
        existing.approval_status !== "rejected"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "You have already paid for or are awaiting approval for this course.",
        });
      }

      if (
        existing.payment_status === "pending" &&
        existing.approval_status === "pending"
      ) {
        return res.status(400).json({
          success: false,
          error: "A payment for this course is already being processed.",
        });
      }

      if (
        existing.payment_status === "failed" ||
        existing.approval_status === "rejected"
      ) {
        await existing.destroy(); // allow retry
      }
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid course price" });
    }

    console.log(`💰 Creating Stripe session for ${course.title} ($${price})`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Course payment",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_BASE_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL}/payment-cancel.html`,
      metadata: { user_id: String(user.id), course_id: String(course.id) },
      customer_email: user.email,
    });

    console.log("✅ Stripe session created:", session.id);
    return res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("🔥 PAYMENT: Checkout session error:", error.stack || error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create checkout session",
    });
  }
};

/* ============================================================
   ✅ Confirm Payment & Create/Update Enrollment
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, session_id, courseId, course_id } = req.body;
    const sid = sessionId || session_id;
    const cid = courseId || course_id;
    const userId = req.user?.id;

    if (!sid || !cid)
      return res.status(400).json({ success: false, error: "Missing IDs" });
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.retrieve(sid);
    if (!session || session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, error: "Payment not completed yet" });
    }

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(cid);
    if (!user || !course)
      return res
        .status(404)
        .json({ success: false, error: "User or course not found" });

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: userId, course_id: cid },
      defaults: { payment_status: "paid", approval_status: "pending" },
    });

    if (!created) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      await enrollment.save();
    }

    return res.json({
      success: true,
      message: "Payment confirmed - enrollment pending admin approval",
      enrollment,
    });
  } catch (error) {
    console.error("❌ PAYMENT CONFIRM ERROR:", error.stack || error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to confirm payment" });
  }
};
