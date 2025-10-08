// // routes/payments.js
// import express from "express";
// import Stripe from "stripe";
// import db from "../models/index.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess } = db;

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

//     // Get course info
//     const [results] = await db.sequelize.query(
//       "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
//       { replacements: [courseId] }
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     const course = results[0];

//     // Prevent duplicate enrollment
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
//               description:
//                 course.description || "Mathematics course enrollment",
//             },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       // ✅ Redirect to success page (no /confirm)
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
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
//     res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (err) {
//     console.error("🔥 Error creating checkout session:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// /* ============================================================
//    ✅ Get course info for payment page
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



// routes/payments.js
import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { Course, UserCourseAccess, Enrollment } = db;

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

    console.log(`💳 Checkout session for user ${user.id}, course ${courseId}`);

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Prevent duplicate access
    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });
    if (existingAccess) {
      return res
        .status(400)
        .json({ error: "You are already enrolled in this course" });
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid course price" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Math course enrollment",
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

    // Record pending status
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
   ✅ Get course info for payment page
   ============================================================ */
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price", "slug"],
    });

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
    console.error("❌ Error fetching payment course:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load course information",
    });
  }
});

/* ============================================================
   ✅ Stripe Webhook (handles payment success)
   ============================================================ */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Stripe needs the raw body
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = parseInt(session.metadata.user_id, 10);
        const courseId = parseInt(session.metadata.course_id, 10);

        console.log(`✅ Payment confirmed for user ${userId}, course ${courseId}`);

        // Update UserCourseAccess
        const access = await UserCourseAccess.findOne({
          where: { user_id: userId, course_id: courseId },
        });

        if (access) {
          access.payment_status = "paid";
          access.approval_status = "approved";
          await access.save();
        } else {
          await UserCourseAccess.create({
            user_id: userId,
            course_id: courseId,
            payment_status: "paid",
            approval_status: "approved",
          });
        }

        // Also update or create Enrollment table record
        const [enrollment, created] = await Enrollment.findOrCreate({
          where: { user_id: userId, course_id: courseId },
          defaults: {
            approval_status: "approved",
            payment_status: "paid",
          },
        });

        if (!created) {
          enrollment.approval_status = "approved";
          enrollment.payment_status = "paid";
          await enrollment.save();
        }

        console.log("🎓 Enrollment and access updated successfully!");
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

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
