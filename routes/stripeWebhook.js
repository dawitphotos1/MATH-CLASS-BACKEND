const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, User, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

// Webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Raw body for Stripe signature
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

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const { userId, courseId } = session.metadata;

        try {
          let enrollment = await UserCourseAccess.findOne({
            where: { userId, courseId },
            include: [
              { model: User, as: "user" },
              { model: Course, as: "course" },
            ],
          });

          if (!enrollment) {
            enrollment = await UserCourseAccess.create({
              userId,
              courseId,
              approved: false,
              accessGrantedAt: new Date(),
            });
            enrollment = await UserCourseAccess.findOne({
              where: { userId, courseId },
              include: [
                { model: User, as: "user" },
                { model: Course, as: "course" },
              ],
            });
          }

          // Log enrollment
          const fs = require("fs");
          const path = require("path");
          const logMsg = `[WEBHOOK-PENDING] ${new Date().toISOString()} - ${
            enrollment.user.email
          } for "${enrollment.course.title}"\n`;
          fs.appendFileSync(
            path.join(__dirname, "../logs/enrollments.log"),
            logMsg
          );

          // Send email
          const { subject, html } = courseEnrollmentApproved(
            enrollment.user,
            enrollment.course
          );
          await sendEmail(enrollment.user.email, subject, html);
        } catch (err) {
          console.error("❌ Error processing webhook:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
