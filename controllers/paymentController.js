// controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User } = db;

/* ============================================================
   ✅ Create Stripe Checkout Session
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    console.log("💰 PAYMENT: Creating checkout session for:", {
      user: user?.email,
      courseId,
    });

    if (!courseId || !user?.id) {
      return res.status(400).json({ success: false, error: "Missing user or course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // 🔍 Prevent duplicate enrollment attempts
    const existing = await Enrollment.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existing) {
      console.log("⚠️ PAYMENT: Duplicate enrollment found");
      return res.status(400).json({ success: false, error: "Already enrolled in this course" });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid course price" });
    }

    // ✅ Create Stripe checkout session
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
      success_url: `https://math-class-platform.netlify.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `https://math-class-platform.netlify.app/payment-cancel.html`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    console.log("✅ PAYMENT: Stripe session created:", session.id);
    res.json({ success: true, sessionId: session.id, url: session.url });

  } catch (error) {
    console.error("🔥 PAYMENT: Checkout session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
};

/* ============================================================
   ✅ Confirm Payment & Create Enrollment (for Admin approval)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, session_id, courseId, course_id } = req.body;
    const sid = sessionId || session_id;
    const cid = courseId || course_id;
    const userId = req.user?.id;

    console.log("💰 PAYMENT CONFIRM: Received confirmation", {
      sessionId: sid,
      courseId: cid,
      userId,
    });

    if (!sid || !cid) {
      return res.status(400).json({ success: false, error: "Missing session or course ID" });
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: Missing user token" });
    }

    // ✅ Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (!session) {
      return res.status(400).json({ success: false, error: "Invalid Stripe session" });
    }
    if (session.payment_status !== "paid") {
      console.log("⚠️ PAYMENT: Session not paid yet:", session.payment_status);
      return res.status(400).json({ success: false, error: "Payment not completed yet" });
    }

    // ✅ Get user & course
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(cid);
    if (!user || !course) {
      return res.status(404).json({ success: false, error: "User or course not found" });
    }

    console.log("✅ PAYMENT: Found user & course:", user.email, course.title);

    // ✅ Create or update enrollment for admin approval
    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: userId, course_id: cid },
      defaults: {
        approval_status: "pending",
        payment_status: "paid",
      },
    });

    // 🔧 Ensure all paid enrollments have correct status
    if (!created) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      await enrollment.save();
      console.log("🔁 PAYMENT: Updated existing enrollment to paid/pending");
    }

    console.log("🎉 PAYMENT: Enrollment recorded for admin approval:", {
      id: enrollment.id,
      user: user.email,
      course: course.title,
      status: {
        payment: enrollment.payment_status,
        approval: enrollment.approval_status,
      },
    });

    return res.json({
      success: true,
      message: "Payment confirmed - enrollment pending admin approval",
      enrollment: {
        id: enrollment.id,
        courseTitle: course.title,
        price: course.price,
        enrollmentDate: new Date().toISOString(),
        approval_status: enrollment.approval_status,
        payment_status: enrollment.payment_status,
      },
    });

  } catch (error) {
    console.error("❌ PAYMENT: Payment confirmation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
    });
  }
};
