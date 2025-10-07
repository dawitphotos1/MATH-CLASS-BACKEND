
// // routes/payments.js
// import express from "express";
// import Stripe from "stripe";
// import db from "../models/index.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
// import { confirmPayment } from "../controllers/paymentConfirmController.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess, User } = db;

// /* ============================================================
//    ✅ Create Stripe Checkout Session
//    ============================================================ */
// router.post("/create-checkout-session", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId) {
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     console.log("💳 Starting checkout session for user:", user.id, "course:", courseId);

//     // Get course info (using raw query ensures we get all columns)
//     const [results] = await db.sequelize.query(
//       "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
//       { replacements: [courseId] }
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const course = results[0];

//     // Check if already enrolled
//     const existingAccess = await UserCourseAccess.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });
//     if (existingAccess) {
//       return res.status(400).json({ error: "Already enrolled in this course" });
//     }

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
//       return res.status(400).json({ error: "Invalid course price" });
//     }

//     // ✅ Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description: course.description || "Mathematics course enrollment",
//             },
//             unit_amount: Math.round(price * 100), // convert to cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email,
//     });

//     // Record pending enrollment
//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: course.id,
//       payment_status: "pending",
//       approval_status: "pending",
//     });

//     console.log("✅ Stripe session created:", session.id);

//     res.json({ success: true, sessionId: session.id });
//   } catch (err) {
//     console.error("🔥 Error creating checkout session:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// /* ============================================================
//    ✅ Confirm payment (via controller)
//    ============================================================ */
// router.post("/confirm", authenticateToken, confirmPayment);

// /* ============================================================
//    ✅ Get course info for payment page (public)
//    ============================================================ */
// router.get("/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const [results] = await db.sequelize.query(
//       "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
//       { replacements: [courseId] }
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const course = results[0];
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
//     console.error("❌ Error fetching course for payment:", err);
//     res.status(500).json({ success: false, error: "Failed to load course information" });
//   }
// });

// /* ============================================================
//    ✅ Health Check
//    ============================================================ */
// router.get("/health/check", (req, res) => {
//   res.json({
//     success: true,
//     message: "Payments route operational",
//     timestamp: new Date().toISOString(),
//   });
// });

// export default router;





import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { Course, UserCourseAccess, User, Enrollment } = db;

/* ============================================================
   ✅ Create Stripe Checkout Session
   ============================================================ */
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    console.log(
      "💳 Starting checkout session for user:",
      user.id,
      "course:",
      courseId
    );

    // Get course info
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if already enrolled
    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existingAccess) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid course price" });
    }

    console.log("💳 Creating Stripe session for course:", course.title);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description || "Mathematics course enrollment",
            },
            unit_amount: Math.round(price * 100), // convert to cents
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

    // Record pending enrollment
    await UserCourseAccess.create({
      user_id: user.id,
      course_id: course.id,
      payment_status: "pending",
      approval_status: "pending",
    });

    console.log("✅ Stripe session created:", session.id);
    res.json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error("🔥 Error creating checkout session:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================================================
   ✅ Confirm payment after successful checkout (FIXED)
   ============================================================ */
router.post("/confirm", authenticateToken, async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user.id;

    console.log("🔄 Processing payment confirmation:", {
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
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log(
        "✅ Stripe session retrieved:",
        session.id,
        "Status:",
        session.payment_status
      );
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError);
      return res.status(400).json({
        success: false,
        error: "Invalid payment session",
      });
    }

    if (session.payment_status !== "paid") {
      console.log("❌ Payment not completed, status:", session.payment_status);
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    // Get user and course details
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);

    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!course) {
      console.error("❌ Course not found:", courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    console.log("✅ User and course found:", user.email, course.title);

    // Check if enrollment already exists in UserCourseAccess
    const existingAccess = await UserCourseAccess.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    let enrollmentAccess;
    if (existingAccess) {
      // Update existing enrollment
      existingAccess.payment_status = "paid";
      existingAccess.approval_status = "approved";
      existingAccess.access_granted_at = new Date();
      await existingAccess.save();
      enrollmentAccess = existingAccess;
      console.log("✅ Updated existing enrollment access:", existingAccess.id);
    } else {
      // Create new enrollment access
      enrollmentAccess = await UserCourseAccess.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "approved",
        access_granted_at: new Date(),
      });
      console.log("✅ Created new enrollment access for user:", userId);
    }

    // Also create/update Enrollment record for compatibility
    const existingEnrollment = await Enrollment.findOne({
      where: {
        studentId: userId,
        courseId: courseId,
      },
    });

    if (existingEnrollment) {
      existingEnrollment.approval_status = "approved";
      await existingEnrollment.save();
      console.log(
        "✅ Updated existing enrollment record:",
        existingEnrollment.id
      );
    } else {
      await Enrollment.create({
        studentId: userId,
        courseId: courseId,
        approval_status: "approved",
      });
      console.log("✅ Created new enrollment record for user:", userId);
    }

    // ✅ SEND CONFIRMATION EMAIL
    try {
      console.log("📧 Sending enrollment confirmation email to:", user.email);
      const emailTemplate = courseEnrollmentApproved(user, course);
      const emailSent = await sendEmail(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );

      if (emailSent) {
        console.log("✅ Enrollment confirmation email sent successfully");
      } else {
        console.warn("⚠️ Email sending failed, but enrollment was successful");
      }
    } catch (emailError) {
      console.error("❌ Email sending error (non-blocking):", emailError);
      // Don't fail the enrollment if email fails
    }

    console.log("🎉 Payment confirmation completed successfully");

    res.json({
      success: true,
      message: "Payment confirmed and enrollment completed successfully",
      enrollment: {
        courseTitle: course.title,
        coursePrice: course.price,
        enrollmentDate: new Date().toISOString(),
        emailSent: true,
      },
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment and enrollment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/* ============================================================
   ✅ Get course info for payment page (public)
   ============================================================ */
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

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
    console.error("❌ Error fetching course for payment:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to load course information" });
  }
});

/* ============================================================
   ✅ Health Check
   ============================================================ */
router.get("/health/check", (req, res) => {
  res.json({
    success: true,
    message: "Payments route operational",
    timestamp: new Date().toISOString(),
  });
});

export default router;