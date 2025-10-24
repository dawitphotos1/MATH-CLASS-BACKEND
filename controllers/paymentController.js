
// // controllers/paymentController.js
// import Stripe from "stripe";
// import db from "../models/index.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, Enrollment, User, Payment } = db;

// const FRONTEND_URL =
//   process.env.FRONTEND_URL ||
//   process.env.FRONTEND_BASE_URL ||
//   "https://math-class-platform.netlify.app";

// console.log("🌍 FRONTEND_URL in use:", FRONTEND_URL);

// /* ============================================================
//    📘 Get Course Info by ID (used by PaymentPage.jsx)
// ============================================================ */
// export const getPaymentByCourseId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const course = await Course.findByPk(id, {
//       attributes: ["id", "title", "description", "price", "thumbnail"],
//       raw: true,
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     const priceValue = parseFloat(course.price) || 0;
//     console.log(`💰 getPaymentByCourseId → ID:${id}, PRICE:${priceValue}`);

//     res.json({
//       success: true,
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: priceValue,
//         thumbnail: course.thumbnail,
//       },
//     });
//   } catch (error) {
//     console.error("❌ getPaymentByCourseId error:", error);
//     res.status(500).json({ success: false, error: "Failed to load course" });
//   }
// };

// /* ============================================================
//    💳 Create Stripe Checkout Session
// ============================================================ */
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId || !user?.id) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing user or course ID" });
//     }

//     const course = await Course.findByPk(courseId, {
//       attributes: ["id", "title", "description", "price"],
//       raw: true,
//     });

//     if (!course) {
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const price = Number(course.price);
//     if (isNaN(price) || price <= 0) {
//       return res.status(400).json({ success: false, error: "Invalid course price" });
//     }

//     // Prevent duplicate payment
//     const existingEnroll = await Enrollment.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existingEnroll && existingEnroll.payment_status === "paid") {
//       return res.status(400).json({
//         success: false,
//         error: "You already paid for this course.",
//       });
//     }

//     // Create Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description: course.description || "Course payment",
//             },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
//       cancel_url: `${FRONTEND_URL}/payment-cancel.html`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email,
//     });

//     // Save pending payment record
//     await Payment.create({
//       user_id: user.id,
//       course_id: course.id,
//       stripe_session_id: session.id,
//       amount: price,
//       status: "pending",
//     });

//     res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (error) {
//     console.error("🔥 createCheckoutSession error:", error);
//     res.status(500).json({ success: false, error: "Failed to create checkout session" });
//   }
// };

// /* ============================================================
//    ✅ Confirm Payment (frontend fallback)
// ============================================================ */
// export const confirmPayment = async (req, res) => {
//   try {
//     const { sessionId, courseId } = req.body;
//     const userId = req.user?.id;

//     if (!sessionId || !courseId)
//       return res.status(400).json({ success: false, error: "Missing IDs" });
//     if (!userId)
//       return res.status(401).json({ success: false, error: "Unauthorized" });

//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     if (!session || session.payment_status !== "paid")
//       return res.status(400).json({ success: false, error: "Payment not completed yet" });

//     const [user, course] = await Promise.all([
//       User.findByPk(userId),
//       Course.findByPk(courseId),
//     ]);

//     if (!user || !course)
//       return res.status(404).json({ success: false, error: "User or course not found" });

//     // Update enrollment
//     let enrollment = await Enrollment.findOne({
//       where: { user_id: userId, course_id: courseId },
//     });

//     if (enrollment) {
//       enrollment.payment_status = "paid";
//       enrollment.approval_status = "pending";
//       await enrollment.save();
//     } else {
//       enrollment = await Enrollment.create({
//         user_id: userId,
//         course_id: courseId,
//         payment_status: "paid",
//         approval_status: "pending",
//       });
//     }

//     // Update Payment record
//     await Payment.update(
//       { status: "paid" },
//       { where: { stripe_session_id: sessionId } }
//     );

//     res.json({
//       success: true,
//       message: "Payment confirmed — enrollment pending admin approval",
//       enrollment,
//     });
//   } catch (error) {
//     console.error("❌ confirmPayment error:", error);
//     res.status(500).json({ success: false, error: "Failed to confirm payment" });
//   }
// };

// /* ============================================================
//    📩 Stripe Webhook
// ============================================================ */
// export const handleStripeWebhook = async (req, res) => {
//   try {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     if (!endpointSecret) {
//       console.warn("⚠️ Missing STRIPE_WEBHOOK_SECRET in .env");
//       return res.status(400).send("Webhook secret not configured");
//     }

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error("❌ Stripe signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const userId = session.metadata?.user_id;
//       const courseId = session.metadata?.course_id;

//       if (!userId || !courseId) {
//         console.warn("⚠️ Missing metadata in Stripe session");
//         return res.status(200).json({ received: true });
//       }

//       const [user, course] = await Promise.all([
//         User.findByPk(userId),
//         Course.findByPk(courseId),
//       ]);

//       if (!user || !course) return res.status(200).json({ received: true });

//       // Update or create enrollment
//       const existing = await Enrollment.findOne({
//         where: { user_id: userId, course_id: courseId },
//       });

//       if (existing) {
//         existing.payment_status = "paid";
//         existing.approval_status = "pending";
//         await existing.save();
//       } else {
//         await Enrollment.create({
//           user_id: userId,
//           course_id: courseId,
//           payment_status: "paid",
//           approval_status: "pending",
//         });
//       }

//       // Mark Payment record as paid
//       await Payment.update(
//         { status: "paid" },
//         { where: { stripe_session_id: session.id } }
//       );

//       console.log(`✅ Payment completed for user:${userId}, course:${courseId}`);
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("🔥 handleStripeWebhook fatal error:", error);
//     res.status(500).json({ success: false, error: "Webhook processing failed" });
//   }
// };




// controllers/paymentController.js
import Stripe from "stripe";
import db from "../models/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User, Payment } = db;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_BASE_URL ||
  "https://math-class-platform.netlify.app";

console.log("🌍 FRONTEND_URL in use:", FRONTEND_URL);

/* ============================================================
   📘 Get Course Info by ID (used by PaymentPage.jsx)
============================================================ */
export const getPaymentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const priceValue = parseFloat(course.price) || 0;
    console.log(`💰 getPaymentByCourseId → ID:${id}, PRICE:${priceValue}`);

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: priceValue,
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error("❌ getPaymentByCourseId error:", error);
    res.status(500).json({ success: false, error: "Failed to load course" });
  }
};

/* ============================================================
   💳 Create Stripe Checkout Session
   (Only Students Can Pay)
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    // ✅ Step 1: Check Role
    if (!user || user.role !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can make course payments.",
      });
    }

    // ✅ Step 2: Validate Inputs
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing course ID" });
    }

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const price = Number(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid course price" });
    }

    // ✅ Step 3: Prevent duplicate payment
    const existing = await Enrollment.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existing) {
      if (existing.payment_status === "paid" && existing.approval_status !== "rejected") {
        return res.status(400).json({
          success: false,
          error: "You have already paid for this course.",
        });
      }
      if (existing.payment_status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Payment already in process. Please wait for confirmation.",
        });
      }
    }

    // ✅ Step 4: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Course payment",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel.html`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    // ✅ Step 5: Save pending payment record
    await Payment.create({
      user_id: user.id,
      course_id: course.id,
      stripe_session_id: session.id,
      amount: price,
      status: "pending",
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("🔥 createCheckoutSession error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
};

/* ============================================================
   ✅ Confirm Payment (Admin Approval Required)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can confirm payments.",
      });
    }

    if (!sessionId || !courseId)
      return res.status(400).json({ success: false, error: "Missing IDs" });
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid")
      return res.status(400).json({ success: false, error: "Payment not completed yet" });

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course)
      return res.status(404).json({ success: false, error: "User or course not found" });

    // ✅ Update enrollment — pending admin approval
    let enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending"; // 🕓 Must be approved by admin
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "pending", // 🕓 Must be approved by admin
      });
    }

    // ✅ Update payment record
    await Payment.update(
      { status: "paid" },
      { where: { stripe_session_id: sessionId } }
    );

    res.json({
      success: true,
      message: "Payment confirmed — awaiting admin approval.",
      enrollment,
    });
  } catch (error) {
    console.error("❌ confirmPayment error:", error);
    res.status(500).json({ success: false, error: "Failed to confirm payment" });
  }
};

/* ============================================================
   📩 Stripe Webhook — auto-mark payments, still needs admin approval
============================================================ */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return res.status(400).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const courseId = session.metadata?.course_id;

      if (!userId || !courseId) {
        return res.status(200).json({ received: true });
      }

      const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
      ]);

      if (!user || !course) return res.status(200).json({ received: true });

      // Create or update enrollment
      const existing = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId },
      });

      if (existing) {
        existing.payment_status = "paid";
        existing.approval_status = "pending"; // 🕓 Admin must approve
        await existing.save();
      } else {
        await Enrollment.create({
          user_id: userId,
          course_id: courseId,
          payment_status: "paid",
          approval_status: "pending",
        });
      }

      // Mark payment as paid
      await Payment.update(
        { status: "paid" },
        { where: { stripe_session_id: session.id } }
      );

      console.log(`✅ Payment completed for student:${userId}, course:${courseId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 handleStripeWebhook fatal error:", error);
    res.status(500).json({ success: false, error: "Webhook processing failed" });
  }
};
