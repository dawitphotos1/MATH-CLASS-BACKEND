const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, User } = require("../models");
const { authMiddleware } = require("../middleware/authMiddleware"); // <-- FIXED import here
const sendEmail = require("../utils/sendEmail");
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");
const enrollmentPendingAdmin = require("../utils/emails/enrollmentPendingAdmin");

// ✅ Create Stripe Checkout Session
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      console.log("Missing courseId in request body");
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      console.log(`Course with id ${courseId} not found`);
      return res.status(404).json({ error: "Course not found" });
    }

    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId }, // Use snake_case
    });
    if (existingAccess) {
      console.log(`User ${user.id} already enrolled in course ${courseId}`);
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      console.log(
        `Invalid course price for course ${courseId}: ${course.price}`
      );
      return res.status(400).json({ error: "Invalid course price" });
    }

    // ✅ Include courseId in success URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description || "Learn mathematics with expert guidance",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        user_id: String(user.id), // Use snake_case in metadata
        course_id: String(course.id),
      },
    });

    // Create pending enrollment
    await UserCourseAccess.create({
      user_id: user.id, // Use snake_case
      course_id: courseId,
      payment_status: "pending",
      approval_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error(
      "🔥 Error creating checkout session:",
      err.message,
      err.stack
    );
    res
      .status(500)
      .json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

// ✅ Confirm payment and record enrollment
router.post("/confirm", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.body;
    const user = req.user;

    if (!session_id) {
      console.log("Missing session_id in request body");
      return res.status(400).json({ error: "Missing session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session || session.payment_status !== "paid") {
      console.log(`Invalid session or payment not completed: ${session_id}`);
      return res.status(400).json({ error: "Payment not completed" });
    }

    const metadata = session.metadata;
    const courseId = parseInt(metadata?.course_id); // Use snake_case
    const metadataUserId = parseInt(metadata?.user_id);
    const authenticatedUserId = parseInt(user.id);

    if (!courseId || !metadataUserId || isNaN(authenticatedUserId)) {
      console.log("Missing or invalid metadata", {
        courseId,
        metadataUserId,
        authenticatedUserId,
      });
      return res
        .status(400)
        .json({ error: "Missing or invalid user or course ID" });
    }

    if (metadataUserId !== authenticatedUserId) {
      console.log(
        `Mismatched user IDs: Stripe=${metadataUserId}, Token=${authenticatedUserId}`
      );
      return res.status(400).json({
        error: "Invalid or mismatched metadata",
        details: { fromStripe: metadataUserId, fromToken: authenticatedUserId },
      });
    }

    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: authenticatedUserId, course_id: courseId }, // Use snake_case
    });

    if (existingAccess) {
      console.log(
        `User ${authenticatedUserId} already enrolled in course ${courseId}`
      );
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }

    await UserCourseAccess.create({
      user_id: authenticatedUserId, // Use snake_case
      course_id: courseId,
      payment_status: "paid",
      approval_status: "pending", // Requires admin approval
      access_granted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // ✅ Send emails
    const student = await User.findByPk(authenticatedUserId);
    const course = await Course.findByPk(courseId);

    if (student && course) {
      const { subject, html } = courseEnrollmentPending(student, course);
      await sendEmail(student.email, subject, html);

      const adminUsers = await User.findAll({ where: { role: "admin" } });
      for (const admin of adminUsers) {
        const adminEmailContent = enrollmentPendingAdmin(student, course);
        await sendEmail(
          admin.email,
          adminEmailContent.subject,
          adminEmailContent.html
        );
      }
    } else {
      console.log("Student or course not found for email notification", {
        studentId: authenticatedUserId,
        courseId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment confirmed and pending approval",
    });
  } catch (err) {
    console.error("🔥 Error confirming payment:", err.message, err.stack);
    res
      .status(500)
      .json({ error: "Failed to confirm enrollment", details: err.message });
  }
});

module.exports = router;
