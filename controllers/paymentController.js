// // Mathe-Class-Website-Backend/controllers/paymentController.js
// import stripePackage from "stripe";
// import db from "../models/index.js";

// const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
// const { Course, Enrollment, User } = db;

// /* Create Stripe Checkout Session */
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId || !user?.id) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing user or course ID" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });
//     }

//     // ✅ Prevent duplicate or repeat payments
//     const existing = await Enrollment.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existing) {
//       // block if already paid or awaiting approval
//       if (
//         existing.payment_status === "paid" &&
//         existing.approval_status !== "rejected"
//       ) {
//         return res.status(400).json({
//           success: false,
//           error: "You have already paid for this course.",
//         });
//       }

//       // optional: clean up failed payment records before retry
//       if (existing.payment_status === "failed") {
//         await existing.destroy();
//       }
//     }
//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course price" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description: course.description || "Mathematics course",
//             },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${
//         process.env.FRONTEND_BASE_URL ||
//         "https://math-class-platform.netlify.app"
//       }/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${
//         course.id
//       }`,
//       cancel_url: `${
//         process.env.FRONTEND_BASE_URL ||
//         "https://math-class-platform.netlify.app"
//       }/payment-cancel.html`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email,
//     });

//     return res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (error) {
//     console.error("🔥 PAYMENT: Checkout session error:", error);
//     return res.status(500).json({ success: false, error: "Failed to create checkout session" });
//   }
// };

// /* Confirm Payment & Create Enrollment */
// export const confirmPayment = async (req, res) => {
//   try {
//     // Accept either naming convention from frontend
//     const { sessionId, session_id, courseId, course_id } = req.body;
//     const sid = sessionId || session_id;
//     const cid = courseId || course_id;
//     const userId = req.user?.id;

//     console.log("💰 PAYMENT CONFIRM: Received confirmation", { sessionId: sid, courseId: cid, userId });

//     if (!sid || !cid) {
//       return res.status(400).json({ success: false, error: "Missing session or course ID" });
//     }
//     if (!userId) {
//       return res.status(401).json({ success: false, error: "Unauthorized: Missing user token" });
//     }

//     // Retrieve stripe session to verify payment status
//     let session;
//     try {
//       session = await stripe.checkout.sessions.retrieve(sid);
//     } catch (err) {
//       console.warn("⚠️ PAYMENT: Could not retrieve Stripe session:", err.message);
//       return res.status(400).json({ success: false, error: "Invalid Stripe session" });
//     }

//     if (!session) {
//       return res.status(400).json({ success: false, error: "Invalid Stripe session" });
//     }

//     if (session.payment_status !== "paid") {
//       console.log("⚠️ PAYMENT: Session not paid yet:", session.payment_status);
//       return res.status(400).json({ success: false, error: "Payment not completed yet" });
//     }

//     const user = await User.findByPk(userId);
//     const course = await Course.findByPk(cid);
//     if (!user || !course) {
//       return res.status(404).json({ success: false, error: "User or course not found" });
//     }

//     // create or update enrollment with pending approval
//     const [enrollment, created] = await Enrollment.findOrCreate({
//       where: { user_id: userId, course_id: cid },
//       defaults: {
//         approval_status: "pending",
//         payment_status: "paid",
//       },
//     });

//     if (!created) {
//       // Ensure statuses are correct
//       enrollment.payment_status = "paid";
//       enrollment.approval_status = "pending";
//       await enrollment.save();
//       console.log("🔁 PAYMENT: Updated existing enrollment to paid/pending");
//     } else {
//       console.log("✅ PAYMENT: Created enrollment (pending) for admin approval:", enrollment.id);
//     }

//     // optional: log to a file or DB logger - but keeping console logs for now
//     return res.json({
//       success: true,
//       message: "Payment confirmed - enrollment pending admin approval",
//       enrollment: {
//         id: enrollment.id,
//         user_id: enrollment.user_id,
//         course_id: enrollment.course_id,
//         approval_status: enrollment.approval_status,
//         payment_status: enrollment.payment_status,
//         createdAt: enrollment.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("❌ PAYMENT: Payment confirmation error:", error);
//     return res.status(500).json({ success: false, error: "Failed to confirm payment" });
//   }
// };





import stripePackage from "stripe";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User } = db;

/* ============================================================
   Create Stripe Checkout Session (single payment per course)
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

    // ✅ Prevent duplicate paid or pending enrollments
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
            "You have already paid for or are awaiting approval for this course.",
        });
      }
      if (
        existing.payment_status === "pending" &&
        existing.approval_status === "pending"
      ) {
        return res.status(400).json({
          success: false,
          error: "A payment for this course is already being processed.",
        });
      }
      if (
        existing.payment_status === "failed" ||
        existing.approval_status === "rejected"
      ) {
        await existing.destroy(); // allow retry
      }
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid course price" });
    }

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
      success_url: `${process.env.FRONTEND_BASE_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL}/payment-cancel.html`,
      metadata: { user_id: String(user.id), course_id: String(course.id) },
      customer_email: user.email,
    });

    return res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error:
          "Duplicate enrollment detected — only one payment allowed per course.",
      });
    }
    console.error("🔥 PAYMENT: Checkout session error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create checkout session" });
  }
};

/* ============================================================
   Confirm Payment & Create/Update Enrollment
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, session_id, courseId, course_id } = req.body;
    const sid = sessionId || session_id;
    const cid = courseId || course_id;
    const userId = req.user?.id;

    if (!sid || !cid)
      return res.status(400).json({ success: false, error: "Missing IDs" });
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.retrieve(sid);
    if (!session || session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, error: "Payment not completed yet" });
    }

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(cid);
    if (!user || !course)
      return res
        .status(404)
        .json({ success: false, error: "User or course not found" });

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: userId, course_id: cid },
      defaults: { payment_status: "paid", approval_status: "pending" },
    });

    if (!created) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      await enrollment.save();
    }

    return res.json({
      success: true,
      message: "Payment confirmed - enrollment pending admin approval",
      enrollment,
    });
  } catch (error) {
    console.error("❌ PAYMENT CONFIRM ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to confirm payment" });
  }
};
