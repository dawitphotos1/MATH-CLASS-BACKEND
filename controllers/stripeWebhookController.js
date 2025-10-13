// controllers/stripeWebhookController.js
import stripePackage from "stripe";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, User, Enrollment } = db;

// ✅ Stripe Webhook endpoint
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
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

        // Find user and course
        const user = await User.findByPk(userId);
        const course = await Course.findByPk(courseId);

        if (!user || !course) {
          console.warn("⚠️ WEBHOOK: User or course not found:", { userId, courseId });
          break;
        }

        console.log("✅ WEBHOOK: Found user & course:", user.email, course.title);

        // ✅ Create or update Enrollment with PENDING status
        console.log("🔄 WEBHOOK: Creating enrollment...");
        
        const [enrollment, enrollmentCreated] = await Enrollment.findOrCreate({
          where: { user_id: userId, course_id: courseId },
          defaults: { 
            approval_status: "pending", // CHANGED FROM "approved" TO "pending"
            payment_status: "paid" 
          },
        });

        console.log("🔄 WEBHOOK: Enrollment result:", {
          id: enrollment.id,
          created: enrollmentCreated,
          approval_status: enrollment.approval_status,
          payment_status: enrollment.payment_status
        });

        if (!enrollmentCreated) {
          // Update existing enrollment
          if (enrollment.approval_status !== "pending" || enrollment.payment_status !== "paid") {
            enrollment.approval_status = "pending";
            enrollment.payment_status = "paid";
            await enrollment.save();
            console.log("✅ WEBHOOK: Updated existing enrollment");
          }
        }

        console.log("🎉 WEBHOOK: Enrollment created for admin approval:", {
          enrollmentId: enrollment.id,
          user: user.email,
          course: course.title
        });

        break;
      }

      default:
        console.log(`ℹ️ WEBHOOK: Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 WEBHOOK: Handler error:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};