// controllers/stripeWebhookController.js

import stripePackage from "stripe";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, User, UserCourseAccess, Enrollment } = db;

// ✅ Stripe Webhook endpoint
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(
      "❌ Stripe webhook signature verification failed:",
      err.message
    );
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Stripe checkout.session.completed:", session.id);

        const userId = session.metadata?.user_id;
        const courseId = session.metadata?.course_id;
        if (!userId || !courseId) {
          console.warn("⚠️ Missing metadata in session:", session.id);
          break;
        }

        // Find user and course
        const user = await User.findByPk(userId);
        const course = await Course.findByPk(courseId);
        if (!user || !course) {
          console.warn("⚠️ User or course not found for webhook:", {
            userId,
            courseId,
          });
          break;
        }

        // Create or update UserCourseAccess
        const [access] = await UserCourseAccess.findOrCreate({
          where: { user_id: userId, course_id: courseId },
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

        // Sync Enrollment table
        console.log(
          "🔄 Syncing Enrollment for user_id:",
          userId,
          "course_id:",
          courseId
        );
        const [enrollment] = await Enrollment.findOrCreate({
          where: { user_id: userId, course_id: courseId },
          defaults: { approval_status: "approved" },
        });
        console.log("🔄 Enrollment record:", enrollment.toJSON());
        if (enrollment.approval_status !== "approved") {
          enrollment.approval_status = "approved";
          await enrollment.save();
          console.log("✅ Updated enrollment approval_status to approved");
        }

        // Send enrollment confirmation email
        try {
          const emailTemplate = courseEnrollmentApproved(user, course);
          await sendEmail(
            user.email,
            emailTemplate.subject,
            emailTemplate.html
          );
          console.log("📧 Enrollment email sent via webhook to:", user.email);
        } catch (emailError) {
          console.warn("⚠️ Email failed (webhook):", emailError.message);
        }

        console.log(
          "🎉 Enrollment confirmed via webhook for user:",
          user.email
        );
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 Webhook handler error:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};