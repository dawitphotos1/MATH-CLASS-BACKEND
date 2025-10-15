// // routes/stripeWebhook.js
// import express from "express";
// import Stripe from "stripe";
// import fs from "fs";
// import path from "path";
// import db from "../models/index.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const { UserCourseAccess, User, Course, Enrollment } = db;

// router.post("/", async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     console.log("✅ Webhook signature verified:", event.type);
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Respond immediately to Stripe
//   res.json({ received: true });

//   try {
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       await handleCheckoutSessionCompleted(session);
//     } else {
//       console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
//     }
//   } catch (error) {
//     console.error("🔥 Webhook processing error:", error);
//   }
// });

// async function handleCheckoutSessionCompleted(session) {
//   console.log("💰 Processing checkout.session.completed:", session.id);
//   const user_id = session.metadata?.user_id;
//   const course_id = session.metadata?.course_id;

//   if (!user_id || !course_id) {
//     console.error("❌ Missing user_id or course_id in session metadata");
//     return;
//   }

//   if (session.payment_status !== "paid") {
//     console.warn("⚠️ Session not paid, status:", session.payment_status);
//     return;
//   }

//   const [user, course] = await Promise.all([
//     User.findByPk(user_id),
//     Course.findByPk(course_id),
//   ]);

//   if (!user) {
//     console.error("❌ User not found:", user_id);
//     return;
//   }
//   if (!course) {
//     console.error("❌ Course not found:", course_id);
//     return;
//   }

//   console.log(`✅ Found user: ${user.email}, course: ${course.title}`);

//   await db.sequelize.transaction(async (transaction) => {
//     const [access, createdAccess] = await UserCourseAccess.findOrCreate({
//       where: { user_id, course_id },
//       defaults: {
//         payment_status: "paid",
//         approval_status: "pending",
//         access_granted_at: new Date(),
//       },
//       transaction,
//     });
//     if (!createdAccess) {
//       access.payment_status = "paid";
//       access.approval_status = "pending";
//       access.access_granted_at = new Date();
//       await access.save({ transaction });
//     }

//     const [enrollment, createdEnroll] = await Enrollment.findOrCreate({
//       where: { user_id, course_id },
//       defaults: {
//         approval_status: "pending",
//         payment_status: "paid",
//       },
//       transaction,
//     });

//     if (!createdEnroll) {
//       enrollment.approval_status = "pending";
//       enrollment.payment_status = "paid";
//       await enrollment.save({ transaction });
//     }

//     console.log(
//       createdEnroll
//         ? `✅ Enrollment created (pending) ID: ${enrollment.id}`
//         : `✅ Enrollment updated (pending) ID: ${enrollment.id}`
//     );

//     logEnrollment(user, course, session.id);
//   });
// }

// function logEnrollment(user, course, sessionId) {
//   try {
//     const logDir = path.join(process.cwd(), "logs");
//     if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

//     const logPath = path.join(logDir, "enrollments.log");
//     const timestamp = new Date().toISOString();
//     const logMsg = `[WEBHOOK] ${timestamp} - ${user.email} enrolled in "${course.title}" - PENDING ADMIN APPROVAL (Session: ${sessionId})\n`;

//     fs.appendFileSync(logPath, logMsg);
//     console.log("📝 Enrollment logged");
//   } catch (err) {
//     console.warn("⚠️ Failed to write enrollment log:", err.message);
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
    console.log("✅ Stripe webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // respond to Stripe immediately
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
    console.error("❌ Missing user_id or course_id");
    return;
  }

  if (session.payment_status !== "paid") {
    console.warn("⚠️ Payment not completed:", session.payment_status);
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
    // Handle UserCourseAccess
    const existingAccess = await UserCourseAccess.findOne({
      where: { user_id, course_id },
      transaction,
    });

    if (existingAccess) {
      existingAccess.payment_status = "paid";
      existingAccess.approval_status = "pending";
      existingAccess.access_granted_at = new Date();
      await existingAccess.save({ transaction });
    } else {
      await UserCourseAccess.create(
        {
          user_id,
          course_id,
          payment_status: "paid",
          approval_status: "pending",
          access_granted_at: new Date(),
        },
        { transaction }
      );
    }

    // Handle Enrollment (avoid duplicates)
    const existingEnrollment = await Enrollment.findOne({
      where: { user_id, course_id },
      transaction,
    });

    if (existingEnrollment) {
      console.log("⚠️ Enrollment already exists. Updating...");
      existingEnrollment.payment_status = "paid";
      existingEnrollment.approval_status = "pending";
      await existingEnrollment.save({ transaction });
    } else {
      await Enrollment.create(
        {
          user_id,
          course_id,
          payment_status: "paid",
          approval_status: "pending",
        },
        { transaction }
      );
      console.log("✅ Created new enrollment record.");
    }
  });

  logEnrollment(user, course, session.id);
  console.log("🎉 Enrollment pending admin approval.");
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
