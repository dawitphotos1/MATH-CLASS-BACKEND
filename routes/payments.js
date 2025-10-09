
// routes/payments.js
import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import authenticateToken from "../middleware/authenticateToken.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, Enrollment, User } = db;

/* ============================================================
   ✅ Stripe Webhook Health Check
   ============================================================ */
router.get("/webhook", (req, res) => {
  res.json({
    success: true,
    message: "Stripe webhook endpoint is live (POST for real events)",
  });
});

/* ============================================================
   ✅ Create Stripe Checkout Session
   ============================================================ */
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      return res.status(400).json({ success: false, error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });
    if (existingAccess) {
      return res.status(400).json({ success: false, error: "Already enrolled in this course" });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid course price" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Mathematics course",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    await UserCourseAccess.create({
      user_id: user.id,
      course_id: course.id,
      payment_status: "pending",
      approval_status: "pending",
    });

    res.json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================================================
   ✅ Confirm Payment (fallback if webhook fails)
   ============================================================ */
router.post("/confirm", authenticateToken, async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user.id;

    if (!sessionId || !courseId) {
      return res.status(400).json({
        success: false,
        error: "Session ID and Course ID are required",
      });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError);
      return res.status(400).json({
        success: false,
        error: "Invalid Stripe session",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);
    if (!user || !course) {
      return res.status(404).json({ success: false, error: "User or course not found" });
    }

    const [access] = await UserCourseAccess.findOrCreate({
      where: { user_id: userId, course_id: courseId },
      defaults: {
        payment_status: "paid",
        approval_status: "approved",
        access_granted_at: new Date(),
      },
    });
    if (!access.isNewRecord) {
      access.payment_status = "paid";
      access.approval_status = "approved";
      access.access_granted_at = new Date();
      await access.save();
    }

    const [enrollment] = await Enrollment.findOrCreate({
      where: { studentId: userId, courseId: courseId },
      defaults: { approval_status: "approved" },
    });
    if (!enrollment.isNewRecord) {
      enrollment.approval_status = "approved";
      await enrollment.save();
    }

    try {
      const emailTemplate = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
      console.log("📧 Confirmation email sent:", user.email);
    } catch (emailError) {
      console.warn("⚠️ Email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: "Payment confirmed and enrollment successful",
      enrollment: {
        courseTitle: course.title,
        price: course.price,
        enrollmentDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/* ============================================================
   ✅ Course Info (frontend fetch)
   ============================================================ */
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }
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
