
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
//     console.log("🔄 Processing payment request:", {
//       courseId,
//       userId: user.id,
//     });

//     if (!courseId) {
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const course = await Course.findByPk(courseId, {
//       attributes: ["id", "title", "description", "price", "slug"],
//     });

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
//               description:
//                 course.description || "Learn mathematics with expert guidance",
//             },
//             unit_amount: Math.round(price * 100), // Convert to cents
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
//       sessionId: session.id,
//     });
//   } catch (err) {
//     console.error("🔥 Error creating checkout session:", err.message);
//     res.status(500).json({
//       success: false,
//       error: `Failed to create checkout session: ${err.message}`,
//     });
//   }
// });

// // ✅ Get course info for payment page (public route) - FIXED VERSION
// router.get("/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("🔍 Fetching course for payment page, ID:", courseId);

//     // Use raw SQL query to ensure we get the price
//     const [results] = await db.sequelize.query(
//       "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
//       { replacements: [courseId] }
//     );

//     if (results.length === 0) {
//       console.log("❌ Course not found for payment page:", courseId);
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     const course = results[0];
//     console.log(
//       "✅ Course found for payment:",
//       course.title,
//       "Price:",
//       course.price
//     );

//     // Ensure price is properly formatted
//     const response = {
//       success: true,
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: parseFloat(course.price) || 0, // Convert to number
//         slug: course.slug,
//       },
//     };

//     console.log(
//       "🔍 DEBUG: Sending response with price:",
//       response.course.price
//     );

//     res.json(response);
//   } catch (err) {
//     console.error("❌ Error fetching course for payment:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load course information",
//     });
//   }
// });

// // ✅ Debug route to test database connection
// router.get("/debug/:courseId", async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("🔍 DEBUG: Testing database connection for course:", courseId);

//     // Test raw query
//     const [results] = await db.sequelize.query(
//       "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
//       { replacements: [courseId] }
//     );

//     console.log("🔍 DEBUG: Raw SQL results:", JSON.stringify(results));

//     if (results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found in debug route",
//       });
//     }

//     const course = results[0];
//     res.json({
//       success: true,
//       course: course,
//       message: "Direct database query successful",
//       price_type: typeof course.price,
//       raw_price: course.price,
//     });
//   } catch (err) {
//     console.error("Debug route error:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
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

const { Course, UserCourseAccess, Enrollment } = db;

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
      attributes: ["id", "title", "description", "price", "slug"],
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

// ✅ NEW: Confirm payment and enrollment
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
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    // Verify session metadata matches
    if (
      session.metadata.user_id !== String(userId) ||
      session.metadata.course_id !== String(courseId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Session verification failed",
      });
    }

    // Check if enrollment already exists in UserCourseAccess
    const existingAccess = await UserCourseAccess.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (existingAccess) {
      // Update existing enrollment
      existingAccess.payment_status = "paid";
      existingAccess.approval_status = "approved";
      existingAccess.access_granted_at = new Date();
      await existingAccess.save();

      console.log("✅ Updated existing enrollment access:", existingAccess.id);
    } else {
      // Create new enrollment access
      await UserCourseAccess.create({
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

    res.json({
      success: true,
      message: "Payment confirmed and enrollment completed successfully",
    });
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment and enrollment",
    });
  }
});

// ✅ Get course info for payment page (public route)
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("🔍 Fetching course for payment page, ID:", courseId);

    // Use raw SQL query to ensure we get the price
    const [results] = await db.sequelize.query(
      "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
      { replacements: [courseId] }
    );

    if (results.length === 0) {
      console.log("❌ Course not found for payment page:", courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const course = results[0];
    console.log(
      "✅ Course found for payment:",
      course.title,
      "Price:",
      course.price
    );

    // Ensure price is properly formatted
    const response = {
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: parseFloat(course.price) || 0,
        slug: course.slug,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching course for payment:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load course information",
    });
  }
});

// ✅ Debug route to test database connection
router.get("/debug/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("🔍 DEBUG: Testing database connection for course:", courseId);

    // Test raw query
    const [results] = await db.sequelize.query(
      "SELECT id, title, description, price, slug FROM courses WHERE id = ?",
      { replacements: [courseId] }
    );

    console.log("🔍 DEBUG: Raw SQL results:", JSON.stringify(results));

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Course not found in debug route",
      });
    }

    const course = results[0];
    res.json({
      success: true,
      course: course,
      message: "Direct database query successful",
      price_type: typeof course.price,
      raw_price: course.price,
    });
  } catch (err) {
    console.error("Debug route error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;