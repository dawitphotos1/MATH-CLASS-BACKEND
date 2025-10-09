// // routes/payments.js
// import express from "express";
// import Stripe from "stripe";
// import db from "../models/index.js";
// import authenticateToken from "../middleware/authenticateToken.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess, Enrollment } = db;

// /* ============================================================
//    ✅ Browser Health Check for /webhook
//    ============================================================ */
// router.get("/webhook", (req, res) => {
//   res.json({
//     success: true,
//     message: "Stripe webhook endpoint is live. Use POST for real events.",
//   });
// });

// /* ============================================================
//    ✅ Create Stripe Checkout Session
//    ============================================================ */
// router.post("/create-checkout-session", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId) return res.status(400).json({ error: "Course ID is required" });

//     const course = await Course.findByPk(courseId, {
//       attributes: ["id", "title", "description", "price", "slug"],
//     });
//     if (!course) return res.status(404).json({ error: "Course not found" });

//     const existingAccess = await UserCourseAccess.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });
//     if (existingAccess)
//       return res.status(400).json({ error: "You are already enrolled in this course" });

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0)
//       return res.status(400).json({ error: "Invalid course price" });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: course.title, description: course.description || "" },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email,
//     });

//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: course.id,
//       payment_status: "pending",
//       approval_status: "pending",
//     });

//     res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (err) {
//     console.error("🔥 Stripe checkout error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// /* ============================================================
//    ✅ Get course info (frontend)
//    ============================================================ */
// router.get("/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const course = await Course.findByPk(courseId, {
//       attributes: ["id", "title", "description", "price", "slug"],
//     });
//     if (!course) return res.status(404).json({ success: false, error: "Course not found" });

//     res.json({
//       success: true,
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: parseFloat(course.price) || 0,
//         slug: course.slug,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Error fetching course:", err);
//     res.status(500).json({ success: false, error: "Failed to load course information" });
//   }
// });

// export default router;





import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, Enrollment } = db;

/* ============================================================
   ✅ Browser Health Check for /webhook
   ============================================================ */
router.get("/webhook", (req, res) => {
  res.json({
    success: true,
    message: "Stripe webhook endpoint is live. Use POST for real events.",
  });
});

/* ============================================================
   ✅ Create Stripe Checkout Session
   ============================================================ */
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId)
      return res.status(400).json({ error: "Course ID is required" });

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existingAccess)
      return res
        .status(400)
        .json({ error: "You are already enrolled in this course" });

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0)
      return res.status(400).json({ error: "Invalid course price" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    await UserCourseAccess.create({
      user_id: user.id,
      course_id: course.id,
      payment_status: "pending",
      approval_status: "pending",
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================================================
   ✅ Confirm Payment Endpoint
   ============================================================ */
router.post("/confirm", authenticateToken, async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user.id;

    console.log("🔐 Payment confirmation request:", {
      sessionId,
      courseId,
      userId,
    });

    if (!sessionId || !courseId) {
      return res.status(400).json({
        success: false,
        error: "Session ID and Course ID are required",
      });
    }

    // Verify the Stripe session
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });
      console.log("✅ Stripe session status:", session.payment_status);
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError);
      return res.status(400).json({
        success: false,
        error: "Invalid payment session",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    // Get user and course
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        error: "User or course not found",
      });
    }

    // Update UserCourseAccess
    const [enrollmentAccess] = await UserCourseAccess.findOrCreate({
      where: { user_id: userId, course_id: courseId },
      defaults: {
        payment_status: "paid",
        approval_status: "approved",
        access_granted_at: new Date(),
      },
    });

    if (!enrollmentAccess.isNewRecord) {
      enrollmentAccess.payment_status = "paid";
      enrollmentAccess.approval_status = "approved";
      enrollmentAccess.access_granted_at = new Date();
      await enrollmentAccess.save();
    }

    // Update Enrollment table
    const [enrollment] = await Enrollment.findOrCreate({
      where: { user_id: userId, course_id: courseId },
      defaults: { approval_status: "approved" },
    });

    if (!enrollment.isNewRecord) {
      enrollment.approval_status = "approved";
      await enrollment.save();
    }

    // Send confirmation email
    try {
      const emailTemplate = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
      console.log("✅ Confirmation email sent to:", user.email);
    } catch (emailError) {
      console.warn("⚠️ Email sending failed:", emailError.message);
    }

    console.log("🎉 Payment confirmation completed for user:", userId);

    return res.json({
      success: true,
      message: "Payment confirmed and enrollment completed successfully",
      enrollment: {
        courseTitle: course.title,
        enrollmentDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/* ============================================================
   ✅ Get course info (frontend)
   ============================================================ */
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: parseFloat(course.price) || 0,
        slug: course.slug,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load course information" });
  }
});

export default router;