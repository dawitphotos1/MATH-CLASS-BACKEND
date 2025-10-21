// // controllers/paymentController.js
// import Stripe from "stripe";
// import db from "../models/index.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, Enrollment, User } = db;

// const FRONTEND_URL =
//   process.env.FRONTEND_URL ||
//   process.env.FRONTEND_BASE_URL ||
//   "https://math-class-platform.netlify.app";

// console.log("🌍 FRONTEND_URL in use:", FRONTEND_URL);

// /* ============================================================
//    📘 Get Course Info by ID
// ============================================================ */
// export const getCourseForPayment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const course = await Course.findByPk(id, {
//       attributes: ["id", "title", "description", "price", "thumbnail"],
//     });

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     res.json({
//       success: true,
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: parseFloat(course.price),
//         thumbnail: course.thumbnail,
//       },
//     });
//   } catch (error) {
//     console.error("❌ getCourseForPayment error:", error);
//     res.status(500).json({ success: false, error: "Failed to load course" });
//   }
// };

// /* ============================================================
//    💳 Create Stripe Checkout Session (duplicate prevention)
// ============================================================ */
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId || !user?.id)
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing user or course ID" });

//     const course = await Course.findByPk(courseId);
//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     const existing = await Enrollment.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existing) {
//       // ✅ Reject if already paid (and not rejected by admin)
//       if (
//         existing.payment_status === "paid" &&
//         existing.approval_status !== "rejected"
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             "You have already paid for this course. Duplicate payments are not allowed.",
//         });
//       }
//       if (existing.payment_status === "pending") {
//         return res.status(400).json({
//           success: false,
//           error: "Payment already in process. Please wait for confirmation.",
//         });
//       }
//     }

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0)
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course price" });

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

//     res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (error) {
//     console.error("🔥 createCheckoutSession error:", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to create checkout session" });
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
//       return res
//         .status(400)
//         .json({ success: false, error: "Payment not completed yet" });

//     const [user, course] = await Promise.all([
//       User.findByPk(userId),
//       Course.findByPk(courseId),
//     ]);
//     if (!user || !course)
//       return res
//         .status(404)
//         .json({ success: false, error: "User or course not found" });

//     let enrollment = await Enrollment.findOne({
//       where: { user_id: userId, course_id: courseId },
//     });

//     if (enrollment) {
//       if (
//         enrollment.payment_status === "paid" &&
//         enrollment.approval_status !== "rejected"
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "Duplicate payment detected.",
//         });
//       }
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

//     res.json({
//       success: true,
//       message: "Payment confirmed — enrollment pending admin approval",
//       enrollment,
//     });
//   } catch (error) {
//     console.error("❌ confirmPayment error:", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to confirm payment" });
//   }
// };

// /* ============================================================
//    📩 Stripe Webhook — main enrollment recorder
// ============================================================ */
// export const handleStripeWebhook = async (req, res) => {
//   try {
//     const sig = req.headers["stripe-signature"];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     // 🔍 DEBUG: Log environment status
//     console.log("🔍 Webhook Debug - Environment Check:");
//     console.log("- STRIPE_WEBHOOK_SECRET available:", !!endpointSecret);
//     console.log("- STRIPE_SECRET_KEY available:", !!process.env.STRIPE_SECRET_KEY);
//     console.log("- Request signature:", sig ? "Present" : "Missing");
//     console.log("- Raw body length:", req.body?.length || 0);

//     if (!endpointSecret) {
//       console.warn("⚠️ Missing STRIPE_WEBHOOK_SECRET in .env");
//       return res.status(400).send("Webhook secret not configured");
//     }

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//       console.log("✅ Stripe webhook verification successful");
//     } catch (err) {
//       console.error("❌ Stripe signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("📩 Stripe webhook received:", event.type);

//     // ✅ Main logic: record successful payment
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const userId = session.metadata?.user_id;
//       const courseId = session.metadata?.course_id;

//       console.log("💰 Payment completed - Full session:", {
//         sessionId: session.id,
//         paymentStatus: session.payment_status,
//         metadata: session.metadata,
//         userId,
//         courseId
//       });

//       if (!userId || !courseId) {
//         console.warn("⚠️ Missing metadata in Stripe session");
//         return res.status(200).json({ received: true });
//       }

//       console.log("🎓 Webhook: Payment completed", { userId, courseId });

//       // Check if user and course exist
//       const [user, course] = await Promise.all([
//         User.findByPk(userId),
//         Course.findByPk(courseId)
//       ]);

//       console.log("👤 User found:", user ? user.email : "NOT FOUND");
//       console.log("📚 Course found:", course ? course.title : "NOT FOUND");

//       if (!user || !course) {
//         console.error("❌ User or course not found - cannot create enrollment");
//         return res.status(200).json({ received: true });
//       }

//       const existing = await Enrollment.findOne({
//         where: { user_id: userId, course_id: courseId },
//       });

//       if (existing) {
//         console.log("🔄 Existing enrollment found:", existing.id);
//         if (existing.payment_status !== "paid") {
//           existing.payment_status = "paid";
//           existing.approval_status = "pending";
//           await existing.save();
//           console.log(`🔄 Updated existing enrollment ${existing.id} to paid`);
//         } else {
//           console.log(`🚫 Webhook skipped — already paid enrollment ${existing.id}`);
//         }
//       } else {
//         const newEnroll = await Enrollment.create({
//           user_id: userId,
//           course_id: courseId,
//           payment_status: "paid",
//           approval_status: "pending",
//         });
//         console.log(`✅ Created new enrollment ${newEnroll.id}`);
        
//         // Verify the enrollment was created
//         const verifyEnroll = await Enrollment.findByPk(newEnroll.id);
//         console.log("🔍 Enrollment verification:", verifyEnroll ? "SUCCESS" : "FAILED");
//       }
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("🔥 handleStripeWebhook fatal error:", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Webhook processing failed" });
//   }
// };





// controllers/paymentController.js
import Stripe from "stripe";
import db from "../models/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User } = db;

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
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: parseFloat(course.price),
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error("❌ getPaymentByCourseId error:", error);
    res.status(500).json({ success: false, error: "Failed to load course" });
  }
};

/* ============================================================
   💳 Create Stripe Checkout Session (duplicate prevention)
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId || !user?.id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing user or course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const existing = await Enrollment.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existing) {
      if (
        existing.payment_status === "paid" &&
        existing.approval_status !== "rejected"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "You have already paid for this course. Duplicate payments are not allowed.",
        });
      }
      if (existing.payment_status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Payment already in process. Please wait for confirmation.",
        });
      }
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid course price" });

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
   ✅ Confirm Payment (frontend fallback)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user?.id;

    if (!sessionId || !courseId)
      return res.status(400).json({ success: false, error: "Missing IDs" });
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid")
      return res
        .status(400)
        .json({ success: false, error: "Payment not completed yet" });

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course)
      return res
        .status(404)
        .json({ success: false, error: "User or course not found" });

    let enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      if (
        enrollment.payment_status === "paid" &&
        enrollment.approval_status !== "rejected"
      ) {
        return res.status(400).json({
          success: false,
          error: "Duplicate payment detected.",
        });
      }
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "pending",
      });
    }

    res.json({
      success: true,
      message: "Payment confirmed — enrollment pending admin approval",
      enrollment,
    });
  } catch (error) {
    console.error("❌ confirmPayment error:", error);
    res.status(500).json({ success: false, error: "Failed to confirm payment" });
  }
};

/* ============================================================
   📩 Stripe Webhook — main enrollment recorder
============================================================ */
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn("⚠️ Missing STRIPE_WEBHOOK_SECRET in .env");
      return res.status(400).send("Webhook secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Stripe webhook verification successful");
    } catch (err) {
      console.error("❌ Stripe signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("📩 Stripe webhook received:", event.type);

    // ✅ Main logic: record successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const courseId = session.metadata?.course_id;

      if (!userId || !courseId) {
        console.warn("⚠️ Missing metadata in Stripe session");
        return res.status(200).json({ received: true });
      }

      const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
      ]);

      if (!user || !course) {
        console.error("❌ User or course not found - cannot create enrollment");
        return res.status(200).json({ received: true });
      }

      const existing = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId },
      });

      if (existing) {
        if (existing.payment_status !== "paid") {
          existing.payment_status = "paid";
          existing.approval_status = "pending";
          await existing.save();
          console.log(`🔄 Updated existing enrollment ${existing.id} to paid`);
        }
      } else {
        const newEnroll = await Enrollment.create({
          user_id: userId,
          course_id: courseId,
          payment_status: "paid",
          approval_status: "pending",
        });
        console.log(`✅ Created new enrollment ${newEnroll.id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("🔥 handleStripeWebhook fatal error:", error);
    res
      .status(500)
      .json({ success: false, error: "Webhook processing failed" });
  }
};
