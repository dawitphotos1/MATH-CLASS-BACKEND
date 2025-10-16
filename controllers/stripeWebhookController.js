// controllers/stripeWebhookController.js
import stripePackage from "stripe";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { User, Course, Enrollment } = db;

/* =====================================================
   🎯 STRIPE WEBHOOK CONTROLLER
===================================================== */
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const raw = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    console.log(`✅ Stripe Webhook verified: ${event.type}`);
  } catch (err) {
    console.error("❌ Stripe webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond quickly to Stripe (avoids timeout)
  res.json({ received: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSession(event.data.object, "paid", "pending");
        break;

      case "checkout.session.async_payment_pending":
        await handleCheckoutSession(event.data.object, "pending", "pending");
        break;

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed":
        await handleCheckoutSession(event.data.object, "failed", "rejected");
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("🔥 Webhook handler error:", error);
  }
};

/* =====================================================
   🧩 Helper: Create or Update Enrollment
===================================================== */
async function handleCheckoutSession(session, paymentStatus, approvalStatus) {
  const userId = session.metadata?.user_id;
  const courseId = session.metadata?.course_id;

  if (!userId || !courseId) {
    console.warn("⚠️ Missing user_id or course_id in metadata:", session.id);
    return;
  }

  const [user, course] = await Promise.all([
    User.findByPk(userId),
    Course.findByPk(courseId),
  ]);

  if (!user || !course) {
    console.warn(`⚠️ Invalid enrollment: user=${userId}, course=${courseId}`);
    return;
  }

  const [enrollment, created] = await Enrollment.findOrCreate({
    where: { user_id: userId, course_id: courseId },
    defaults: { payment_status: paymentStatus, approval_status: approvalStatus },
  });

  if (!created) {
    enrollment.payment_status = paymentStatus;
    enrollment.approval_status = approvalStatus;
    await enrollment.save();
    console.log(`🔄 Enrollment updated: ${user.email} → ${course.title}`);
  } else {
    console.log(`🆕 Enrollment created: ${user.email} → ${course.title}`);
  }

  // ✉️ Send appropriate email based on payment status
  if (paymentStatus === "paid") {
    await sendPaymentEmail(user, course);
  } else if (paymentStatus === "pending") {
    await sendPendingEmail(user, course);
  } else if (paymentStatus === "failed") {
    await sendFailedEmail(user, course);
  }

  writeEnrollmentLog(user, course, session.id, paymentStatus, approvalStatus);
}

/* =====================================================
   ✉️ Email Templates
===================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* ✅ SUCCESSFUL PAYMENT */
async function sendPaymentEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `✅ Payment Received for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border-radius:10px;background:#f9f9f9;">
          <h2 style="color:#2ecc71;">Payment Confirmed!</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>We’ve received your payment for the course:</p>
          <h3>"${course.title}"</h3>
          <p>Your enrollment is now <strong>pending admin approval</strong>. You’ll receive another email once access is granted.</p>
          <p>Thank you for choosing <strong>Math Class Platform</strong>! 🎓</p>
          <br/>
          <p style="font-size:0.9em;color:#555;">If you have any questions, contact <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Payment confirmation email sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Failed to send payment email:", err.message);
  }
}

/* ⏳ PENDING PAYMENT */
async function sendPendingEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `⏳ Payment Pending for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border-radius:10px;background:#f9f9f9;">
          <h2 style="color:#f39c12;">Payment Pending</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>Your payment for <strong>${course.title}</strong> is still pending. This can happen due to delayed card authorization or network issues.</p>
          <p>Please check your bank account to confirm if the charge was processed. If not, you can retry enrolling anytime.</p>
          <br/>
          <p style="font-size:0.9em;color:#555;">For help, contact <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Pending payment email sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Failed to send pending email:", err.message);
  }
}

/* ❌ FAILED PAYMENT */
async function sendFailedEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `❌ Payment Failed for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border-radius:10px;background:#f9f9f9;">
          <h2 style="color:#e74c3c;">Payment Failed</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>Unfortunately, your payment for <strong>${course.title}</strong> did not complete successfully.</p>
          <p>No charges were made. Please try enrolling again with a valid payment method.</p>
          <br/>
          <p style="font-size:0.9em;color:#555;">Need assistance? Reach us at <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Failed payment email sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Failed to send failed email:", err.message);
  }
}

/* =====================================================
   📝 Write Enrollment Log
===================================================== */
function writeEnrollmentLog(user, course, sessionId, paymentStatus, approvalStatus) {
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const logPath = path.join(logDir, "enrollments.log");
    const timestamp = new Date().toISOString();
    const msg = `[WEBHOOK] ${timestamp} - ${user.email} - "${course.title}" - ${paymentStatus}/${approvalStatus} (Session: ${sessionId})\n`;
    fs.appendFileSync(logPath, msg);
    console.log("📝 Enrollment logged successfully");
  } catch (err) {
    console.warn("⚠️ Could not write webhook log:", err.message);
  }
}
