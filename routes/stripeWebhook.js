
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
const { UserCourseAccess, User, Course } = db;

// ✅ Stripe Webhook Endpoint
router.post(
  "/stripe",
  express.raw({ type: "application/json" }), // Stripe requires raw body
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const { user_id, course_id } = session.metadata || {};

        try {
          console.log("💰 Payment completed for user:", user_id, "course:", course_id);

          // Find or create course access record
          let record = await UserCourseAccess.findOne({
            where: { user_id, course_id },
            include: [
              { model: User, as: "user" },
              { model: Course, as: "course" },
            ],
          });

          if (!record) {
            record = await UserCourseAccess.create({
              user_id,
              course_id,
              payment_status: "paid",
              approval_status: "approved",
              created_at: new Date(),
              updated_at: new Date(),
            });
          } else {
            record.payment_status = "paid";
            record.approval_status = "approved";
            await record.save();
          }

          // ✅ Log webhook event
          const logPath = path.join(process.cwd(), "logs", "enrollments.log");
          fs.mkdirSync(path.dirname(logPath), { recursive: true });
          const logMsg = `[WEBHOOK] ${new Date().toISOString()} - ${
            record.user?.email || "unknown"
          } paid for "${record.course?.title || course_id}"\n`;
          fs.appendFileSync(logPath, logMsg);

          // ✅ Send email confirmation
          if (record.user?.email && record.course?.title) {
            const emailHTML = courseEnrollmentApproved(record.user.name, record.course.title);
            await sendEmail({
              to: record.user.email,
              subject: `✅ Enrollment Confirmed - ${record.course.title}`,
              html: emailHTML,
            });
            console.log("📧 Confirmation email sent to:", record.user.email);
          }

          console.log("✅ Payment auto-confirmed for user:", user_id);
        } catch (err) {
          console.error("❌ Error processing webhook:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

export default router;
