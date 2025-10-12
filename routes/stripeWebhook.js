
// // routes/stripeWebhook.js
// import express from "express";
// import Stripe from "stripe";
// import fs from "fs";
// import path from "path";
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { UserCourseAccess, User, Course, Enrollment } = db;

// // ✅ Stripe Webhook Endpoint
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // Stripe needs raw body
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;
//     try {
//       // Use rawBody to verify signature
//       event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
//     } catch (err) {
//       console.error("❌ Stripe signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       if (event.type === "checkout.session.completed") {
//         const session = event.data.object;

//         if (session.payment_status === "paid") {
//           const user_id = session.metadata?.user_id;
//           const course_id = session.metadata?.course_id;

//           console.log("💰 Webhook Payment completed:", { user_id, course_id });

//           if (!user_id || !course_id) {
//             console.warn("⚠️ Missing metadata in session:", session.id);
//             return res.status(200).json({ received: true });
//           }

//           // Ensure User and Course exist
//           const user = await User.findByPk(user_id);
//           const course = await Course.findByPk(course_id);
//           if (!user || !course) {
//             console.warn("⚠️ Missing user or course for webhook:", { user_id, course_id });
//             return res.status(200).json({ received: true });
//           }

//           // Find or create UserCourseAccess
//           const [access] = await UserCourseAccess.findOrCreate({
//             where: { user_id, course_id },
//             defaults: {
//               payment_status: "paid",
//               approval_status: "approved",
//               access_granted_at: new Date(),
//             },
//           });

//           if (access.payment_status !== "paid") {
//             access.payment_status = "paid";
//             access.approval_status = "approved";
//             access.access_granted_at = new Date();
//             await access.save();
//           }

//           // Sync with Enrollment table
//           const [enrollment] = await Enrollment.findOrCreate({
//             where: { studentId: user_id, courseId: course_id },
//             defaults: { approval_status: "approved" },
//           });
//           if (enrollment.approval_status !== "approved") {
//             enrollment.approval_status = "approved";
//             await enrollment.save();
//           }

//           // ✅ Log the event for debugging
//           const logDir = path.join(process.cwd(), "logs");
//           fs.mkdirSync(logDir, { recursive: true });
//           const logPath = path.join(logDir, "enrollments.log");
//           const logMsg = `[WEBHOOK] ${new Date().toISOString()} - ${user.email} enrolled in "${course.title}"\n`;
//           fs.appendFileSync(logPath, logMsg);

//           // ✅ Send email confirmation
//           try {
//             const emailTemplate = courseEnrollmentApproved(user, course);
//             await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
//             console.log("📧 Enrollment confirmation email sent to:", user.email);
//           } catch (emailError) {
//             console.warn("⚠️ Email send error (non-blocking):", emailError.message);
//           }

//           console.log("✅ Webhook enrollment confirmed for user:", user.email);
//         }
//       } else {
//         console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
//       }

//       res.json({ received: true });
//     } catch (err) {
//       console.error("🔥 Webhook processing error:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   }
// );

// export default router;



// routes/stripeWebhook.js
import express from "express";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, User, Course, Enrollment } = db;

// ✅ Stripe Webhook Endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Stripe needs raw body
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      // Use rawBody to verify signature
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        if (session.payment_status === "paid") {
          const user_id = session.metadata?.user_id;
          const course_id = session.metadata?.course_id;

          console.log("💰 Webhook Payment completed:", { user_id, course_id });

          if (!user_id || !course_id) {
            console.warn("⚠️ Missing metadata in session:", session.id);
            return res.status(200).json({ received: true });
          }

          // Ensure User and Course exist
          const user = await User.findByPk(user_id);
          const course = await Course.findByPck(course_id);
          if (!user || !course) {
            console.warn("⚠️ Missing user or course for webhook:", { user_id, course_id });
            return res.status(200).json({ received: true });
          }

          // ✅ Find or create UserCourseAccess
          const [access] = await UserCourseAccess.findOrCreate({
            where: { user_id, course_id },
            defaults: {
              payment_status: "paid",
              approval_status: "approved",
              access_granted_at: new Date(),
            },
          });

          if (access.payment_status !== "paid") {
            access.payment_status = "paid";
            access.approval_status = "approved";
            access.access_granted_at = new Date();
            await access.save();
          }

          // ✅ FIXED: Use correct field names that match your Enrollment model
          const [enrollment] = await Enrollment.findOrCreate({
            where: { 
              user_id: user_id,      // Changed from studentId to user_id
              course_id: course_id   // Changed from courseId to course_id
            },
            defaults: { 
              approval_status: "approved",
              payment_status: "paid"
            },
          });

          if (enrollment.approval_status !== "approved" || enrollment.payment_status !== "paid") {
            enrollment.approval_status = "approved";
            enrollment.payment_status = "paid";
            await enrollment.save();
          }

          // ✅ Log the event for debugging
          const logDir = path.join(process.cwd(), "logs");
          fs.mkdirSync(logDir, { recursive: true });
          const logPath = path.join(logDir, "enrollments.log");
          const logMsg = `[WEBHOOK] ${new Date().toISOString()} - ${user.email} enrolled in "${course.title}"\n`;
          fs.appendFileSync(logPath, logMsg);

          // ✅ Send email confirmation
          try {
            const emailTemplate = courseEnrollmentApproved(user, course);
            await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
            console.log("📧 Enrollment confirmation email sent to:", user.email);
          } catch (emailError) {
            console.warn("⚠️ Email send error (non-blocking):", emailError.message);
          }

          console.log("✅ Webhook enrollment confirmed for user:", user.email);
        }
      } else {
        console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("🔥 Webhook processing error:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;