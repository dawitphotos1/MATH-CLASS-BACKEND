// // controllers/stripeWebhookController.js
// import stripePackage from "stripe";
// import fs from "fs";
// import path from "path";
// import nodemailer from "nodemailer";
// import db from "../models/index.js";

// const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
// const { User, Course, Enrollment } = db;

// /* =====================================================
//    🎯 STRIPE WEBHOOK CONTROLLER
// ===================================================== */
// export const stripeWebhookHandler = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   let event;

//   try {
//     const raw = req.rawBody || req.body;
//     event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
//     console.log(`✅ Stripe Webhook verified: ${event.type}`);
//   } catch (err) {
//     console.error("❌ Stripe webhook verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Respond immediately to Stripe
//   res.json({ received: true });

//   try {
//     switch (event.type) {
//       case "checkout.session.completed":
//         await handleCheckoutSession(event.data.object, "paid", "pending");
//         break;
//       case "checkout.session.async_payment_pending":
//         await handleCheckoutSession(event.data.object, "pending", "pending");
//         break;
//       case "checkout.session.async_payment_failed":
//       case "payment_intent.payment_failed":
//         await handleCheckoutSession(event.data.object, "failed", "rejected");
//         break;
//       default:
//         console.log(`ℹ️ Unhandled event type: ${event.type}`);
//     }
//   } catch (error) {
//     console.error("🔥 Webhook handler error:", error);
//   }
// };

// /* =====================================================
//    🧩 Handle Checkout Session
// ===================================================== */
// async function handleCheckoutSession(session, paymentStatus, approvalStatus) {
//   const userId = session.metadata?.user_id;
//   const courseId = session.metadata?.course_id;

//   if (!userId || !courseId) {
//     console.warn("⚠️ Missing metadata in session:", session.id);
//     return;
//   }

//   const [user, course] = await Promise.all([
//     User.findByPk(userId),
//     Course.findByPk(courseId),
//   ]);

//   if (!user || !course) {
//     console.warn("⚠️ Invalid user or course:", userId, courseId);
//     return;
//   }

//   const [enrollment, created] = await Enrollment.findOrCreate({
//     where: { user_id: userId, course_id: courseId },
//     defaults: { payment_status: paymentStatus, approval_status: approvalStatus },
//   });

//   if (!created) {
//     enrollment.payment_status = paymentStatus;
//     enrollment.approval_status = approvalStatus;
//     await enrollment.save();
//   }

//   // ✉️ Send student and admin emails
//   if (paymentStatus === "paid") {
//     await sendPaymentEmail(user, course);
//   } else if (paymentStatus === "pending") {
//     await sendPendingEmail(user, course);
//   } else if (paymentStatus === "failed") {
//     await sendFailedEmail(user, course);
//   }

//   await notifyAdminEmail(user, course, paymentStatus);

//   writeEnrollmentLog(user, course, session.id, paymentStatus, approvalStatus);
// }

// /* =====================================================
//    📩 Notify Admin (HTML Template)
// ===================================================== */
// async function notifyAdminEmail(user, course, status) {
//   try {
//     const color =
//       status === "paid"
//         ? "#2ecc71"
//         : status === "pending"
//         ? "#f39c12"
//         : "#e74c3c";

//     const title =
//       status === "paid"
//         ? "✅ New Payment Received"
//         : status === "pending"
//         ? "⏳ Payment Pending"
//         : "❌ Payment Failed";

//     const adminDashboardURL = `${process.env.FRONTEND_URL}/admin`;

//     await transporter.sendMail({
//       from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
//       to: process.env.EMAIL_FROM,
//       subject: `${title} – ${user.email}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px;background:#f9f9f9;border-radius:10px;">
//           <h2 style="color:${color}">${title}</h2>
//           <p><strong>Student:</strong> ${user.name || user.email}</p>
//           <p><strong>Course:</strong> ${course.title}</p>
//           <p><strong>Status:</strong> ${status.toUpperCase()}</p>
//           <hr/>
//           <p style="font-size:0.9em;color:#555;">
//             Review and approve this enrollment in your
//             <a href="${adminDashboardURL}" target="_blank">Admin Dashboard</a>.
//           </p>
//         </div>
//       `,
//     });

//     console.log(`📧 Admin notified (${status}) for ${course.title}`);
//   } catch (err) {
//     console.error("⚠️ Failed to send admin email:", err.message);
//   }
// }

// /* =====================================================
//    ✉️ Nodemailer Transport
// ===================================================== */
// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   secure: true,
//   auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
// });

// /* =====================================================
//    🎨 Student Email Templates (HTML Styled)
// ===================================================== */

// // ✅ SUCCESSFUL PAYMENT
// async function sendPaymentEmail(user, course) {
//   try {
//     await transporter.sendMail({
//       from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
//       to: user.email,
//       subject: `✅ Payment Received for "${course.title}"`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
//           <h2 style="color:#2ecc71;">Payment Confirmed!</h2>
//           <p>Hi ${user.name || "Student"},</p>
//           <p>We’ve successfully received your payment for:</p>
//           <h3>"${course.title}"</h3>
//           <p>Your enrollment is now <strong>pending admin approval</strong>. You'll receive an email once access is granted.</p>
//           <br/>
//           <p>Thank you for learning with <strong>Math Class Platform</strong> 🎓</p>
//           <p style="font-size:0.9em;color:#777;">Need help? Contact <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
//         </div>
//       `,
//     });
//     console.log(`📧 Payment confirmation sent to ${user.email}`);
//   } catch (err) {
//     console.error("⚠️ Payment email failed:", err.message);
//   }
// }

// // ⏳ PENDING PAYMENT
// async function sendPendingEmail(user, course) {
//   try {
//     await transporter.sendMail({
//       from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
//       to: user.email,
//       subject: `⏳ Payment Pending for "${course.title}"`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
//           <h2 style="color:#f39c12;">Payment Pending</h2>
//           <p>Hi ${user.name || "Student"},</p>
//           <p>Your payment for <strong>${course.title}</strong> is still being processed. This could be due to card verification or a delay in confirmation.</p>
//           <p>You’ll receive another update when the payment is finalized.</p>
//           <p style="font-size:0.9em;color:#777;">Questions? Email <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
//         </div>
//       `,
//     });
//     console.log(`📧 Pending email sent to ${user.email}`);
//   } catch (err) {
//     console.error("⚠️ Pending email failed:", err.message);
//   }
// }

// // ❌ FAILED PAYMENT
// async function sendFailedEmail(user, course) {
//   try {
//     await transporter.sendMail({
//       from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
//       to: user.email,
//       subject: `❌ Payment Failed for "${course.title}"`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
//           <h2 style="color:#e74c3c;">Payment Failed</h2>
//           <p>Hi ${user.name || "Student"},</p>
//           <p>Unfortunately, your payment for <strong>${course.title}</strong> did not complete successfully.</p>
//           <p>No charges were made. Please try again later using a valid payment method.</p>
//           <p style="font-size:0.9em;color:#777;">If you continue to experience issues, reach out to <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
//         </div>
//       `,
//     });
//     console.log(`📧 Failed email sent to ${user.email}`);
//   } catch (err) {
//     console.error("⚠️ Failed email failed:", err.message);
//   }
// }

// /* =====================================================
//    📝 Write Enrollment Log
// ===================================================== */
// function writeEnrollmentLog(user, course, sessionId, paymentStatus, approvalStatus) {
//   try {
//     const logDir = path.join(process.cwd(), "logs");
//     if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
//     const logPath = path.join(logDir, "enrollments.log");
//     const msg = `[WEBHOOK] ${new Date().toISOString()} - ${user.email} - "${course.title}" - ${paymentStatus}/${approvalStatus} (Session: ${sessionId})\n`;
//     fs.appendFileSync(logPath, msg);
//     console.log("📝 Enrollment logged successfully");
//   } catch (err) {
//     console.warn("⚠️ Could not write webhook log:", err.message);
//   }
// }







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

  // Respond immediately to Stripe
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
   🧩 Handle Checkout Session - ENHANCED VERSION
===================================================== */
async function handleCheckoutSession(session, paymentStatus, approvalStatus) {
  const userId = session.metadata?.user_id;
  const courseId = session.metadata?.course_id;

  console.log('🔄 Webhook processing session:', {
    sessionId: session.id,
    userId,
    courseId,
    paymentStatus,
    payment_status: session.payment_status
  });

  if (!userId || !courseId) {
    console.warn("⚠️ Missing metadata in session:", session.id);
    return;
  }

  try {
    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course) {
      console.warn("⚠️ Invalid user or course:", userId, courseId);
      return;
    }

    console.log(`🔍 Found user: ${user.email}, course: ${course.title}`);

    // 🧩 ENHANCED: Better enrollment handling
    let enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (enrollment) {
      // Update existing enrollment
      enrollment.payment_status = paymentStatus;
      enrollment.approval_status = approvalStatus;
      await enrollment.save();
      console.log(`🔄 Updated existing enrollment: ${enrollment.id}`);
    } else {
      // Create new enrollment
      enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: paymentStatus,
        approval_status: approvalStatus,
      });
      console.log(`✅ Created new enrollment: ${enrollment.id}`);
    }

    // 🧩 VERIFY: Check enrollment was created properly
    const verifyEnrollment = await Enrollment.findByPk(enrollment.id);
    console.log('🔍 Enrollment verification:', {
      id: verifyEnrollment?.id,
      payment_status: verifyEnrollment?.payment_status,
      approval_status: verifyEnrollment?.approval_status
    });

    // ✉️ Send emails only for successful payments
    if (paymentStatus === "paid") {
      await sendPaymentEmail(user, course);
      await notifyAdminEmail(user, course, paymentStatus);
    } else if (paymentStatus === "pending") {
      await sendPendingEmail(user, course);
    } else if (paymentStatus === "failed") {
      await sendFailedEmail(user, course);
    }

    writeEnrollmentLog(user, course, session.id, paymentStatus, approvalStatus);
    
  } catch (error) {
    console.error('💥 Webhook enrollment processing failed:', error);
  }
}

/* =====================================================
   📩 Notify Admin (HTML Template)
===================================================== */
async function notifyAdminEmail(user, course, status) {
  try {
    const color =
      status === "paid"
        ? "#2ecc71"
        : status === "pending"
        ? "#f39c12"
        : "#e74c3c";

    const title =
      status === "paid"
        ? "✅ New Payment Received"
        : status === "pending"
        ? "⏳ Payment Pending"
        : "❌ Payment Failed";

    const adminDashboardURL = `${process.env.FRONTEND_URL}/admin`;

    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      subject: `${title} – ${user.email}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px;background:#f9f9f9;border-radius:10px;">
          <h2 style="color:${color}">${title}</h2>
          <p><strong>Student:</strong> ${user.name || user.email}</p>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Status:</strong> ${status.toUpperCase()}</p>
          <hr/>
          <p style="font-size:0.9em;color:#555;">
            Review and approve this enrollment in your
            <a href="${adminDashboardURL}" target="_blank">Admin Dashboard</a>.
          </p>
        </div>
      `,
    });

    console.log(`📧 Admin notified (${status}) for ${course.title}`);
  } catch (err) {
    console.error("⚠️ Failed to send admin email:", err.message);
  }
}

/* =====================================================
   ✉️ Nodemailer Transport
===================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

/* =====================================================
   🎨 Student Email Templates (HTML Styled)
===================================================== */

// ✅ SUCCESSFUL PAYMENT
async function sendPaymentEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `✅ Payment Received for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
          <h2 style="color:#2ecc71;">Payment Confirmed!</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>We've successfully received your payment for:</p>
          <h3>"${course.title}"</h3>
          <p>Your enrollment is now <strong>pending admin approval</strong>. You'll receive an email once access is granted.</p>
          <br/>
          <p>Thank you for learning with <strong>Math Class Platform</strong> 🎓</p>
          <p style="font-size:0.9em;color:#777;">Need help? Contact <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Payment confirmation sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Payment email failed:", err.message);
  }
}

// ⏳ PENDING PAYMENT
async function sendPendingEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `⏳ Payment Pending for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
          <h2 style="color:#f39c12;">Payment Pending</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>Your payment for <strong>${course.title}</strong> is still being processed. This could be due to card verification or a delay in confirmation.</p>
          <p>You'll receive another update when the payment is finalized.</p>
          <p style="font-size:0.9em;color:#777;">Questions? Email <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Pending email sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Pending email failed:", err.message);
  }
}

// ❌ FAILED PAYMENT
async function sendFailedEmail(user, course) {
  try {
    await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `❌ Payment Failed for "${course.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:25px;background:#f9f9f9;border-radius:10px;">
          <h2 style="color:#e74c3c;">Payment Failed</h2>
          <p>Hi ${user.name || "Student"},</p>
          <p>Unfortunately, your payment for <strong>${course.title}</strong> did not complete successfully.</p>
          <p>No charges were made. Please try again later using a valid payment method.</p>
          <p style="font-size:0.9em;color:#777;">If you continue to experience issues, reach out to <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
        </div>
      `,
    });
    console.log(`📧 Failed email sent to ${user.email}`);
  } catch (err) {
    console.error("⚠️ Failed email failed:", err.message);
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
    const msg = `[WEBHOOK] ${new Date().toISOString()} - ${user.email} - "${course.title}" - ${paymentStatus}/${approvalStatus} (Session: ${sessionId})\n`;
    fs.appendFileSync(logPath, msg);
    console.log("📝 Enrollment logged successfully");
  } catch (err) {
    console.warn("⚠️ Could not write webhook log:", err.message);
  }
}