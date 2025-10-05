
// // routes/payments.js
// import express from "express";
// import Stripe from "stripe";
// import db from "../models/index.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const { Course, UserCourseAccess } = db;

// // ✅ Create Stripe Checkout Session (requires authentication)
// router.post("/create-checkout-session", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     console.log("🔄 Processing payment request:", { courseId, userId: user.id });

//     if (!courseId) {
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // Check existing enrollment
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

//     console.log("💳 Creating Stripe session for:", course.title);

//     // ✅ Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description: course.description || "Learn mathematics with expert guidance",
//             },
//             unit_amount: Math.round(price * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email,
//     });

//     // Record pending enrollment
//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: courseId,
//       payment_status: "pending",
//       approval_status: "pending",
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     console.log("✅ Payment session created successfully:", session.id);

//     res.status(200).json({ 
//       success: true,
//       sessionId: session.id 
//     });

//   } catch (err) {
//     console.error("🔥 Error creating checkout session:", err.message);
//     res.status(500).json({ 
//       success: false,
//       error: `Failed to create checkout session: ${err.message}` 
//     });
//   }
// });

// // ✅ Get course info for payment page (public route)
// router.get("/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const course = await Course.findByPk(courseId);
    
//     if (!course) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     res.json({
//       success: true,
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: course.price,
//         slug: course.slug,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching course for payment:", err);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to load course information" 
//     });
//   }
// });

// export default router;



import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess } = db;

// ✅ Create Stripe Checkout Session (requires authentication)
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;
    console.log("🔄 Processing payment request:", {
      courseId,
      userId: user.id,
    });

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price"], // Explicit attributes
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check existing enrollment
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

    console.log("💳 Creating Stripe session for:", course.title);

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description || "Learn mathematics with expert guidance",
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    // Record pending enrollment
    await UserCourseAccess.create({
      user_id: user.id,
      course_id: courseId,
      payment_status: "pending",
      approval_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("✅ Payment session created successfully:", session.id);
    res.status(200).json({
      success: true,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("🔥 Error creating checkout session:", err.message);
    res.status(500).json({
      success: false,
      error: `Failed to create checkout session: ${err.message}`,
    });
  }
});

// ✅ Get course info for payment page (public route) - FIXED
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("🔍 Fetching course for payment page, ID:", courseId);

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price", "slug", "teacher_id"], // Explicit attributes
    });

    if (!course) {
      console.log("❌ Course not found for payment page:", courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    console.log("✅ Course found for payment:", course.title);
    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        slug: course.slug,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching course for payment:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to load course information",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;