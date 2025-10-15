// Mathe-Class-Website-Backend/controllers/stripeWebhookController.js
import stripePackage from "stripe";
import db from "../models/index.js";
import fs from "fs";
import path from "path";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, User, Enrollment } = db;

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // some setups put raw body into req.rawBody; if you used express.raw in your route you will have req.body as Buffer
    const raw = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    console.log("✅ WEBHOOK: Signature verified:", event.type);
  } catch (err) {
    console.error("❌ WEBHOOK: Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("💰 WEBHOOK: checkout.session.completed:", session.id);
        const userId = session.metadata?.user_id;
        const courseId = session.metadata?.course_id;

        console.log("📦 WEBHOOK: Session metadata:", session.metadata);

        if (!userId || !courseId) {
          console.warn("⚠️ WEBHOOK: Missing metadata in session:", session.id);
          break;
        }

        // verify user & course exist
        const user = await User.findByPk(userId);
        const course = await Course.findByPk(courseId);

        if (!user || !course) {
          console.warn("⚠️ WEBHOOK: User or course not found:", { userId, courseId });
          break;
        }

        // Create or update enrollment with pending status (for admin approval)
        const [enrollment, created] = await Enrollment.findOrCreate({
          where: { user_id: userId, course_id: courseId },
          defaults: {
            approval_status: "pending",
            payment_status: "paid",
          },
        });

        if (!created) {
          // ensure statuses
          if (enrollment.approval_status !== "pending" || enrollment.payment_status !== "paid") {
            enrollment.approval_status = "pending";
            enrollment.payment_status = "paid";
            await enrollment.save();
            console.log("✅ WEBHOOK: Updated existing enrollment to paid/pending");
          }
        } else {
          console.log("✅ WEBHOOK: Created enrollment for admin approval:", enrollment.id);
        }

        // write an entry to enrollments.log for traceability
        try {
          const logsDir = path.join(process.cwd(), "logs");
          if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
          const logPath = path.join(logsDir, "enrollments.log");
          const msg = `[WEBHOOK] ${new Date().toISOString()} - user:${user.email} course:${course.title} session:${session.id} enrollmentId:${enrollment.id}\n`;
          fs.appendFileSync(logPath, msg);
        } catch (logErr) {
          console.warn("⚠️ WEBHOOK: Failed to write enrollment log:", logErr.message);
        }

        break;
      }

      default:
        console.log(`ℹ️ WEBHOOK: Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 WEBHOOK: Handler error:", error.stack || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
