// // controllers/paymentController.js
// import Stripe from "stripe";
// import db from "../models/index.js";
// import Course from "../models/courseModel.js";


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { Course, Enrollment, User } = db;

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
//       raw: true, // ✅ Ensures we get plain values, not model instance
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     const priceValue =
//       course.price !== undefined && course.price !== null
//         ? parseFloat(course.price)
//         : 0;

//     console.log(`💰 getPaymentByCourseId → ID:${id}, PRICE:${priceValue}`);

//     return res.json({
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
//    💳 Create Stripe Checkout Session (Fixed)
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

//     // ✅ Make sure we fetch plain data
//     const course = await Course.findByPk(courseId, {
//       attributes: ["id", "title", "description", "price"],
//       raw: true,
//     });

//     if (!course) {
//       console.error(`❌ Course not found for ID: ${courseId}`);
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     // ✅ Convert safely and verify price
//     const price = Number(course.price);
//     console.log(`💰 Stripe Session → courseId:${courseId}, price:${price}`);

//     if (!price || isNaN(price) || price <= 0) {
//       console.error("❌ Invalid price detected for course:", course);
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course price" });
//     }

//     // ✅ Prevent double payment
//     const existing = await Enrollment.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existing) {
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

//     // ✅ Stripe session creation
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
//     res.status(500).json({
//       success: false,
//       error: "Failed to create checkout session",
//     });
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
//       console.log("✅ Stripe webhook verification successful");
//     } catch (err) {
//       console.error("❌ Stripe signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("📩 Stripe webhook received:", event.type);

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

//       if (!user || !course) {
//         console.error("❌ User or course not found - cannot create enrollment");
//         return res.status(200).json({ received: true });
//       }

//       const existing = await Enrollment.findOne({
//         where: { user_id: userId, course_id: courseId },
//       });

//       if (existing) {
//         if (existing.payment_status !== "paid") {
//           existing.payment_status = "paid";
//           existing.approval_status = "pending";
//           await existing.save();
//           console.log(`🔄 Updated existing enrollment ${existing.id} to paid`);
//         }
//       } else {
//         const newEnroll = await Enrollment.create({
//           user_id: userId,
//           course_id: courseId,
//           payment_status: "paid",
//           approval_status: "pending",
//         });
//         console.log(`✅ Created new enrollment ${newEnroll.id}`);
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
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import Payment from "../models/paymentModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ============================================================
   1️⃣ Get Course Info by ID or Slug
============================================================ */
export const getPaymentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching course for payment:", id);

    let course = null;

    // 1️⃣ Try valid Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      course = await Course.findById(id).lean();
    }

    // 2️⃣ Try by numeric id (for legacy SQL-like data)
    if (!course && !isNaN(id)) {
      course = await Course.findOne({ id: Number(id) }).lean();
    }

    // 3️⃣ Try by slug
    if (!course) {
      course = await Course.findOne({ slug: id }).lean();
    }

    if (!course) {
      console.warn("⚠️ Course not found for:", id);
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error("❌ getPaymentByCourseId error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load course for payment",
      error: error.message,
    });
  }
};

/* ============================================================
   2️⃣ Create Stripe Checkout Session
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log("💰 Creating checkout session for course:", courseId);

    let course = null;

    // 1️⃣ Try by ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(courseId)) {
      course = await Course.findById(courseId);
    }

    // 2️⃣ Try by numeric ID
    if (!course && !isNaN(courseId)) {
      course = await Course.findOne({ id: Number(courseId) });
    }

    // 3️⃣ Try by slug
    if (!course) {
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      console.warn("⚠️ Course not found for:", courseId);
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // ✅ Validate price
    const price = Number(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid course price" });
    }

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.title },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?course=${course._id || course.id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel?course=${course._id || course.id}`,
      metadata: { courseId: String(course._id || course.id) },
    });

    console.log("✅ Stripe session created:", session.id);
    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("❌ createCheckoutSession error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create checkout session",
    });
  }
};

/* ============================================================
   3️⃣ Confirm Payment (after success)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({ success: false, error: "Missing courseId or userId" });
    }

    const payment = await Payment.create({
      courseId,
      userId,
      status: "paid",
      date: new Date(),
    });

    console.log("✅ Payment confirmed:", payment);
    res.json({ success: true, payment });
  } catch (error) {
    console.error("❌ confirmPayment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ============================================================
   4️⃣ Stripe Webhook (backend listener)
============================================================ */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const courseId = session.metadata?.courseId;
    console.log("✅ Stripe checkout completed for course:", courseId);
  }

  res.json({ received: true });
};
