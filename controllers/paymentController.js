// controllers/paymentController.js
import Stripe from "stripe";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User, Payment } = db;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_BASE_URL ||
  "https://math-class-platform.netlify.app";

console.log("🌍 FRONTEND_URL in use:", FRONTEND_URL);

/* ============================================================
   📘 Get Course Info by ID (used by PaymentPage.jsx)
============================================================ */
export const getPaymentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const priceValue = parseFloat(course.price) || 0;
    console.log(`💰 getPaymentByCourseId → ID:${id}, PRICE:${priceValue}`);

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: priceValue,
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error("❌ getPaymentByCourseId error:", error);
    res.status(500).json({ success: false, error: "Failed to load course" });
  }
};

/* ============================================================
   💳 Create Stripe Checkout Session (Only Students)
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!user || user.role !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can make course payments.",
      });
    }

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing course ID" });
    }

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const price = Number(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid course price" });
    }

    // Prevent duplicate payment
    const existing = await Enrollment.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existing) {
      if (existing.payment_status === "paid" && existing.approval_status !== "rejected") {
        return res.status(400).json({
          success: false,
          error: "You have already paid for this course.",
        });
      }
      if (existing.payment_status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Payment already in process. Please wait for confirmation.",
        });
      }
    }

    // Create Stripe checkout session
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
      success_url: `${FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel.html`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    // Save pending payment record
    await Payment.create({
      user_id: user.id,
      course_id: course.id,
      stripe_session_id: session.id,
      amount: price,
      status: "pending",
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("🔥 createCheckoutSession error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
};

/* ============================================================
   ✅ Confirm Payment (Marks as paid & Sends Admin Alert)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can confirm payments.",
      });
    }

    if (!sessionId || !courseId)
      return res.status(400).json({ success: false, error: "Missing IDs" });
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid")
      return res.status(400).json({ success: false, error: "Payment not completed yet" });

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course)
      return res.status(404).json({ success: false, error: "User or course not found" });

    // Update enrollment — pending admin approval
    let enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "pending",
      });
    }

    // Update payment record
    await Payment.update(
      { status: "paid" },
      { where: { stripe_session_id: sessionId } }
    );

    // === Notify Admin of New Payment ===
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      await sendEmail({
        to: adminEmail,
        subject: `💰 New Payment: ${user.name} paid for ${course.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Payment Received</h2>
            <p><strong>Student:</strong> ${user.name} (${user.email})</p>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Amount:</strong> $${course.price}</p>
            <p>Status: <strong>Paid (Pending Admin Approval)</strong></p>
            <br/>
            <a href="${process.env.FRONTEND_URL}/admin" 
               style="display:inline-block;margin-top:10px;padding:10px 20px;
               background:#2ecc71;color:#fff;text-decoration:none;border-radius:5px;">
               Review Payment in Admin Dashboard
            </a>
          </div>
        `,
      });
      console.log(`📧 Admin notified of payment from ${user.email}`);
    } catch (err) {
      console.warn("⚠️ Failed to send admin payment alert:", err.message);
    }

    res.json({
      success: true,
      message: "Payment confirmed — awaiting admin approval.",
      enrollment,
    });
  } catch (error) {
    console.error("❌ confirmPayment error:", error);
    res.status(500).json({ success: false, error: "Failed to confirm payment" });
  }
};

/* ============================================================
   📩 Stripe Webhook — auto-mark payments + Admin Alert
============================================================ */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return res.status(400).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const courseId = session.metadata?.course_id;

      if (!userId || !courseId) {
        return res.status(200).json({ received: true });
      }

      const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
      ]);

      if (!user || !course) return res.status(200).json({ received: true });

      // Create or update enrollment
      const existing = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId },
      });

      if (existing) {
        existing.payment_status = "paid";
        existing.approval_status = "pending";
        await existing.save();
      } else {
        await Enrollment.create({
          user_id: userId,
          course_id: courseId,
          payment_status: "paid",
          approval_status: "pending",
        });
      }

      // Mark payment as paid
      await Payment.update(
        { status: "paid" },
        { where: { stripe_session_id: session.id } }
      );

      console.log(`✅ Payment completed for student:${userId}, course:${courseId}`);

      // === Notify Admin of New Payment ===
      try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
        await sendEmail({
          to: adminEmail,
          subject: `💰 New Payment via Stripe: ${user.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>New Stripe Payment Completed</h2>
              <p><strong>Student:</strong> ${user.name} (${user.email})</p>
              <p><strong>Course:</strong> ${course.title}</p>
              <p><strong>Amount:</strong> $${course.price}</p>
              <p>Status: <strong>Paid (Pending Admin Approval)</strong></p>
              <br/>
              <a href="${process.env.FRONTEND_URL}/admin" 
                 style="display:inline-block;margin-top:10px;padding:10px 20px;
                 background:#3498db;color:#fff;text-decoration:none;border-radius:5px;">
                 Review Payment in Admin Dashboard
              </a>
            </div>
          `,
        });
        console.log(`📧 Admin notified (webhook) for payment by ${user.email}`);
      } catch (err) {
        console.warn("⚠️ Webhook: Failed to send admin payment alert:", err.message);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 handleStripeWebhook fatal error:", error);
    res.status(500).json({ success: false, error: "Webhook processing failed" });
  }
};
