
// controllers/paymentConfirmController.js
import stripePackage from "stripe";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, User, Course } = db;

/**
 * ✅ Confirm payment after successful Stripe checkout
 * Marks the course access as paid + approved and sends confirmation email.
 */
export const confirmPayment = async (req, res) => {
  try {
    const { session_id, course_id } = req.body;
    const userId = req.user.id;

    if (!session_id || !course_id) {
      return res.status(400).json({ error: "Missing session_id or course_id" });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return res.status(404).json({ error: "Stripe session not found" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Find pending access
    const record = await UserCourseAccess.findOne({
      where: { user_id: userId, course_id },
    });

    if (!record) {
      return res.status(404).json({ error: "Pending enrollment not found" });
    }

    // ✅ Update record
    record.payment_status = "paid";
    record.approval_status = "approved";
    await record.save();

    // Fetch data for email
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(course_id);

    // Send confirmation email
    if (user?.email && course?.title) {
      await sendEmail({
        to: user.email,
        subject: "✅ Enrollment Confirmed - " + course.title,
        html: courseEnrollmentApproved(user.name, course.title),
      });
    }

    console.log("✅ Payment confirmed for user:", userId, "course:", course_id);

    return res.json({
      success: true,
      message: "Payment confirmed and enrollment approved",
    });
  } catch (err) {
    console.error("❌ Payment confirmation error:", err);
    return res.status(500).json({ error: "Server error during payment confirmation" });
  }
};
