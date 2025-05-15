
// const express = require("express");
// const Stripe = require("stripe");
// const { User, sequelize, UserCourseAccess } = require("../models"); // ✅ include UserCourseAccess
// const bcrypt = require("bcryptjs");

// const router = express.Router();
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// router.post("/create-checkout-session", async (req, res) => {
//   try {
//     const { courseId, userData } = req.body;
//     console.log("💳 Starting checkout session:", { courseId, userData });

//     const isRegistration = courseId === "registration_fee";

//     // 🚫 Restrict payment to students only
//     if (!isRegistration && (!userData || userData.role !== "student")) {
//       return res
//         .status(403)
//         .json({ error: "Only students can enroll in courses." });
//     }

//     // Registration logic
//     if (isRegistration) {
//       if (!userData?.email || !userData?.name || !userData?.password) {
//         return res
//           .status(400)
//           .json({ error: "Missing user registration data." });
//       }

//       const existingUser = await User.findOne({
//         where: { email: userData.email },
//       });
//       if (existingUser) {
//         return res.status(400).json({ error: "Email already registered." });
//       }

//       const hashedPassword = await bcrypt.hash(userData.password, 10);
//       await User.create({
//         name: userData.name,
//         email: userData.email,
//         password: hashedPassword,
//         role: userData.role || "student",
//         subject: userData.subject,
//         approvalStatus: "pending",
//       });

//       console.log("✅ User created:", userData.email);
//     }

//     // Set price based on course ID
//     let price;
//     if (isRegistration) {
//       price = parseInt(process.env.REGISTRATION_FEE || "1000");
//     } else {
//       switch (String(courseId)) {
//         case "7":
//         case "8":
//         case "9":
//           price = 20000;
//           break;
//         case "10":
//         case "11":
//         case "12":
//           price = 25000;
//           break;
//         default:
//           price = 4999;
//       }
//     }

//     const courseNames = {
//       7: "Algebra 1",
//       8: "Algebra 2",
//       9: "Pre-Calculus",
//       10: "Calculus",
//       11: "Geometry & Trigonometry",
//       12: "Statistics & Probability",
//     };

//     const description = isRegistration
//       ? "Math Class Platform Registration Fee"
//       : `Course Payment for ${courseNames[courseId] || "Course"}`;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             unit_amount: price,
//             product_data: { name: description },
//           },
//           quantity: 1,
//         },
//       ],
//       customer_email: userData?.email || undefined,
//       metadata: {
//         courseId,
//         userEmail: userData?.email || "unknown",
//       },
//       success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//     });

//     // Store pending enrollment
//     if (!isRegistration && userData?.id && courseId) {
//       const [access, created] = await UserCourseAccess.findOrCreate({
//         where: {
//           userId: userData.id,
//           courseId: parseInt(courseId),
//         },
//         defaults: {
//           accessGrantedAt: new Date(),
//           approved: false,
//         },
//       });

//       if (!created) {
//         console.log("⚠️ Enrollment already exists");
//       } else {
//         console.log("✅ Pending enrollment created");
//       }
//     }

//     res.json({ id: session.id });
//   } catch (err) {
//     console.error("❌ Payment error:", err.message);
//     res.status(500).json({
//       error: "Failed to create Stripe session",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// });

// // Webhook (not used in test mode)
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     console.log(
//       "Webhook received but ignored (STRIPE_WEBHOOK_SECRET=disabled)"
//     );
//     res.json({ received: true });
//   }
// );

// module.exports = router;



// const express = require("express");
// const Stripe = require("stripe");
// const { User, sequelize, UserCourseAccess } = require("../models");
// const bcrypt = require("bcryptjs");

// const router = express.Router();

// // Initialize Stripe (will validate in middleware)
// const stripe = process.env.STRIPE_SECRET_KEY
//   ? new Stripe(process.env.STRIPE_SECRET_KEY)
//   : null;

// // Middleware to validate STRIPE_SECRET_KEY and FRONTEND_URL
// const validatePaymentConfig = (req, res, next) => {
//   // Validate STRIPE_SECRET_KEY
//   if (!process.env.STRIPE_SECRET_KEY) {
//     console.error("❌ STRIPE_SECRET_KEY is missing in environment variables");
//     return res
//       .status(500)
//       .json({
//         error: "Server configuration error: Stripe secret key is missing",
//       });
//   }
//   if (!process.env.STRIPE_SECRET_KEY.match(/^(sk|sk_test)_[0-9a-zA-Z]+$/)) {
//     console.error("❌ Invalid STRIPE_SECRET_KEY format");
//     return res
//       .status(500)
//       .json({
//         error: "Server configuration error: Invalid Stripe secret key format",
//       });
//   }

//   // Validate FRONTEND_URL
//   if (!process.env.FRONTEND_URL) {
//     console.error("❌ FRONTEND_URL is missing in environment variables");
//     return res
//       .status(500)
//       .json({ error: "Server configuration error: Frontend URL is missing" });
//   }
//   try {
//     new URL(process.env.FRONTEND_URL); // Throws if invalid URL
//     if (!process.env.FRONTEND_URL.match(/^https?:\/\//)) {
//       console.error(
//         "❌ Invalid FRONTEND_URL: Must start with http:// or https://"
//       );
//       return res
//         .status(500)
//         .json({
//           error:
//             "Server configuration error: Frontend URL must start with http:// or https://",
//         });
//     }
//   } catch (error) {
//     console.error("❌ Invalid FRONTEND_URL format:", error.message);
//     return res
//       .status(500)
//       .json({
//         error: "Server configuration error: Invalid Frontend URL format",
//       });
//   }

//   // Ensure Stripe is initialized
//   if (!stripe) {
//     console.error("❌ Stripe initialization failed");
//     return res
//       .status(500)
//       .json({ error: "Server configuration error: Stripe not initialized" });
//   }

//   next();
// };

// router.post(
//   "/create-checkout-session",
//   validatePaymentConfig,
//   async (req, res) => {
//     try {
//       const { courseId, userData } = req.body;
//       console.log("💳 Starting checkout session:", { courseId, userData });

//       const isRegistration = courseId === "registration_fee";

//       // Validate userData and role for course enrollment
//       if (!isRegistration && (!userData || userData.role !== "student")) {
//         return res
//           .status(403)
//           .json({ error: "Only students can enroll in courses." });
//       }

//       // Registration logic
//       if (isRegistration) {
//         if (!userData?.email || !userData?.name || !userData?.password) {
//           return res
//             .status(400)
//             .json({ error: "Missing user registration data." });
//         }

//         const existingUser = await User.findOne({
//           where: { email: userData.email },
//         });
//         if (existingUser) {
//           return res.status(400).json({ error: "Email already registered." });
//         }

//         const hashedPassword = await bcrypt.hash(userData.password, 10);
//         await User.create({
//           name: userData.name,
//           email: userData.email,
//           password: hashedPassword,
//           role: userData.role || "student",
//           subject: userData.subject,
//           approvalStatus: "pending",
//         });

//         console.log("✅ User created:", userData.email);
//       }

//       // Set price based on course ID
//       let price;
//       if (isRegistration) {
//         price = parseInt(process.env.REGISTRATION_FEE || "1000");
//       } else {
//         switch (String(courseId)) {
//           case "7":
//           case "8":
//           case "9":
//             price = 20000;
//             break;
//           case "10":
//           case "11":
//           case "12":
//             price = 25000;
//             break;
//           default:
//             price = 4999;
//         }
//       }

//       const courseNames = {
//         7: "Algebra 1",
//         8: "Algebra 2",
//         9: "Pre-Calculus",
//         10: "Calculus",
//         11: "Geometry & Trigonometry",
//         12: "Statistics & Probability",
//       };

//       const description = isRegistration
//         ? "Math Class Platform Registration Fee"
//         : `Course Payment for ${courseNames[courseId] || "Course"}`;

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: [
//           {
//             price_data: {
//               currency: "usd",
//               unit_amount: price,
//               product_data: { name: description },
//             },
//             quantity: 1,
//           },
//         ],
//         customer_email: userData?.email || undefined,
//         metadata: {
//           courseId,
//           userEmail: userData?.email || "unknown",
//         },
//         success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//       });

//       // Store pending enrollment
//       if (!isRegistration && userData?.id && courseId) {
//         const [access, created] = await UserCourseAccess.findOrCreate({
//           where: {
//             userId: userData.id,
//             courseId: parseInt(courseId),
//           },
//           defaults: {
//             accessGrantedAt: new Date(),
//             approved: false,
//           },
//         });

//         if (!created) {
//           console.log("⚠️ Enrollment already exists");
//         } else {
//           console.log("✅ Pending enrollment created");
//         }
//       }

//       res.json({ id: session.id });
//     } catch (err) {
//       console.error("❌ Payment error:", {
//         message: err.message,
//         stack: err.stack,
//       });
//       res.status(500).json({
//         error: "Failed to create Stripe session",
//         details:
//           process.env.NODE_ENV === "development" ? err.message : undefined,
//       });
//     }
//   }
// );

// // Webhook (not used in test mode)
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     console.log(
//       "Webhook received but ignored (STRIPE_WEBHOOK_SECRET=disabled)"
//     );
//     res.json({ received: true });
//   }
// );

// module.exports = router;



const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { courseId, userEmail } = session.metadata;

      if (courseId !== "registration_fee") {
        const user = await User.findOne({ where: { email: userEmail } });
        if (user) {
          await UserCourseAccess.update(
            { approved: true },
            {
              where: {
                userId: user.id,
                courseId: parseInt(courseId),
              },
            }
          );
          console.log(
            `✅ Approved enrollment for user ${userEmail}, course ${courseId}`
          );
        }
      }
    }

    res.json({ received: true });
  }
);