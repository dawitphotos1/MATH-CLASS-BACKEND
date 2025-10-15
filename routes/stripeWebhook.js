// // routes/stripeWebhook.js - FIXED: Set approval_status to "pending"
// import express from "express";
// import Stripe from "stripe";
// import fs from "fs";
// import path from "path";
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { UserCourseAccess, User, Course, Enrollment } = db;

// // ✅ Stripe Webhook Endpoint
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//       console.log("✅ Webhook signature verified:", event.type);
//     } catch (err) {
//       console.error("❌ Webhook signature verification failed:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Immediately acknowledge receipt
//     res.json({ received: true });

//     try {
//       if (event.type === "checkout.session.completed") {
//         await handleCheckoutSessionCompleted(event.data.object);
//       } else {
//         console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
//       }
//     } catch (error) {
//       console.error("🔥 Webhook processing error:", error);
//     }
//   }
// );

// async function handleCheckoutSessionCompleted(session) {
//   console.log("💰 Processing checkout.session.completed:", session.id);
//   console.log("📦 Session metadata:", session.metadata);
//   console.log("💰 Payment status:", session.payment_status);

//   // Extract metadata
//   const user_id = session.metadata?.user_id;
//   const course_id = session.metadata?.course_id;

//   if (!user_id || !course_id) {
//     console.error("❌ Missing user_id or course_id in session metadata");
//     return;
//   }

//   if (session.payment_status !== "paid") {
//     console.warn("⚠️ Session not paid, payment status:", session.payment_status);
//     return;
//   }

//   console.log("🔍 Processing enrollment for:", { user_id, course_id });

//   try {
//     // Verify user and course exist
//     const [user, course] = await Promise.all([
//       User.findByPk(user_id),
//       Course.findByPk(course_id)
//     ]);

//     if (!user) {
//       console.error("❌ User not found:", user_id);
//       return;
//     }
//     if (!course) {
//       console.error("❌ Course not found:", course_id);
//       return;
//     }

//     console.log(`✅ Found user: ${user.email}, course: ${course.title}`);

//     // Use transaction for data consistency
//     await db.sequelize.transaction(async (transaction) => {
//       // 1. Create or update UserCourseAccess with PENDING status
//       const [access, accessCreated] = await UserCourseAccess.findOrCreate({
//         where: { user_id, course_id },
//         defaults: {
//           payment_status: "paid",
//           approval_status: "pending", // FIXED: Set to pending for admin approval
//           access_granted_at: new Date(),
//         },
//         transaction,
//       });

//       if (!accessCreated) {
//         access.payment_status = "paid";
//         access.approval_status = "pending"; // FIXED: Set to pending for admin approval
//         access.access_granted_at = new Date();
//         await access.save({ transaction });
//       }

//       console.log("✅ UserCourseAccess processed - ID:", access.id);

//       // 2. Create or update Enrollment - THIS IS WHAT THE ADMIN DASHBOARD NEEDS
//       const [enrollment, enrollmentCreated] = await Enrollment.findOrCreate({
//         where: { 
//           user_id: user_id,
//           course_id: course_id
//         },
//         defaults: { 
//           approval_status: "pending", // FIXED: Changed from "approved" to "pending"
//           payment_status: "paid",
//         },
//         transaction
//       });

//       if (!enrollmentCreated) {
//         enrollment.approval_status = "pending"; // FIXED: Changed from "approved" to "pending"
//         enrollment.payment_status = "paid";
//         await enrollment.save({ transaction });
//         console.log("✅ Updated existing enrollment - ID:", enrollment.id);
//       } else {
//         console.log("✅ Created new enrollment - ID:", enrollment.id);
//       }

//       // Log successful enrollment
//       await logEnrollment(user, course, session.id);

//       // Don't send approval email yet - wait for admin approval
//       console.log("📧 Enrollment created with PENDING status - waiting for admin approval");
//     });

//     console.log("🎉 Enrollment created successfully for user:", user.email, "(Pending admin approval)");

//   } catch (error) {
//     console.error("🔥 Error processing enrollment:", error);
//     throw error;
//   }
// }

// async function logEnrollment(user, course, sessionId) {
//   try {
//     const logDir = path.join(process.cwd(), "logs");
//     if (!fs.existsSync(logDir)) {
//       fs.mkdirSync(logDir, { recursive: true });
//     }
    
//     const logPath = path.join(logDir, "enrollments.log");
//     const timestamp = new Date().toISOString();
//     const logMsg = `[WEBHOOK] ${timestamp} - ${user.email} enrolled in "${course.title}" - PENDING ADMIN APPROVAL (Session: ${sessionId})\n`;
    
//     fs.appendFileSync(logPath, logMsg);
//     console.log("📝 Enrollment logged to file");
//   } catch (logError) {
//     console.warn("⚠️ Failed to write to log file:", logError.message);
//   }
// }

// export default router;





// routes/stripeWebhook.js
import express from "express";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import db from "../models/index.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, User, Course, Enrollment } = db;

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ Webhook signature verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond immediately to Stripe
  res.json({ received: true });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
    } else {
      console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error("🔥 Webhook processing error:", error);
  }
});

async function handleCheckoutSessionCompleted(session) {
  console.log("💰 Processing checkout.session.completed:", session.id);
  const user_id = session.metadata?.user_id;
  const course_id = session.metadata?.course_id;

  if (!user_id || !course_id) {
    console.error("❌ Missing user_id or course_id in session metadata");
    return;
  }

  if (session.payment_status !== "paid") {
    console.warn("⚠️ Session not paid, status:", session.payment_status);
    return;
  }

  const [user, course] = await Promise.all([
    User.findByPk(user_id),
    Course.findByPk(course_id),
  ]);

  if (!user) {
    console.error("❌ User not found:", user_id);
    return;
  }
  if (!course) {
    console.error("❌ Course not found:", course_id);
    return;
  }

  console.log(`✅ Found user: ${user.email}, course: ${course.title}`);

  await db.sequelize.transaction(async (transaction) => {
    const [access, createdAccess] = await UserCourseAccess.findOrCreate({
      where: { user_id, course_id },
      defaults: {
        payment_status: "paid",
        approval_status: "pending",
        access_granted_at: new Date(),
      },
      transaction,
    });
    if (!createdAccess) {
      access.payment_status = "paid";
      access.approval_status = "pending";
      access.access_granted_at = new Date();
      await access.save({ transaction });
    }

    const [enrollment, createdEnroll] = await Enrollment.findOrCreate({
      where: { user_id, course_id },
      defaults: {
        approval_status: "pending",
        payment_status: "paid",
      },
      transaction,
    });

    if (!createdEnroll) {
      enrollment.approval_status = "pending";
      enrollment.payment_status = "paid";
      await enrollment.save({ transaction });
    }

    console.log(
      createdEnroll
        ? `✅ Enrollment created (pending) ID: ${enrollment.id}`
        : `✅ Enrollment updated (pending) ID: ${enrollment.id}`
    );

    logEnrollment(user, course, session.id);
  });
}

function logEnrollment(user, course, sessionId) {
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const logPath = path.join(logDir, "enrollments.log");
    const timestamp = new Date().toISOString();
    const logMsg = `[WEBHOOK] ${timestamp} - ${user.email} enrolled in "${course.title}" - PENDING ADMIN APPROVAL (Session: ${sessionId})\n`;

    fs.appendFileSync(logPath, logMsg);
    console.log("📝 Enrollment logged");
  } catch (err) {
    console.warn("⚠️ Failed to write enrollment log:", err.message);
  }
}

export default router;
