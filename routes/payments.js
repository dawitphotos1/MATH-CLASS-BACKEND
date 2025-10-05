
// // routes/payments.js
// const express = require("express");
// const router = express.Router();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess } = require("../models");
// const authMiddleware = require("../middleware/authMiddleware");

// // ✅ Create Stripe Checkout Session (REQUIRES AUTH)
// router.post("/create-checkout-session", authMiddleware, async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId) {
//       console.log("Missing courseId in request body");
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       console.log(`Course with id ${courseId} not found`);
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // Check existing enrollment
//     const existingAccess = await UserCourseAccess.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existingAccess) {
//       console.log(`User ${user.id} already enrolled in course ${courseId}`);
//       return res.status(400).json({ error: "Already enrolled in this course" });
//     }

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
//       console.log(`Invalid course price for course ${courseId}: ${course.price}`);
//       return res.status(400).json({ error: "Invalid course price" });
//     }

//     // ✅ Create Stripe checkout session
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
//     });

//     // Create pending enrollment
//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: courseId,
//       payment_status: "pending",
//       approval_status: "pending",
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(200).json({ sessionId: session.id });
//   } catch (err) {
//     console.error("🔥 Error creating checkout session:", err.message, err.stack);
//     res.status(500).json({ error: `Failed to create checkout session: ${err.message}` });
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

//     // Return course info for payment page
//     res.json({
//       course: {
//         id: course.id,
//         title: course.title,
//         description: course.description,
//         price: course.price,
//         slug: course.slug
//       }
//     });
//   } catch (err) {
//     console.error("Error fetching course for payment:", err);
//     res.status(500).json({ error: "Failed to load course information" });
//   }
// });

// module.exports = router;



// routes/payments.js
import express from "express";
import Stripe from "stripe";
import db from "../models/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { Course, UserCourseAccess } = db;

// ✅ Create Stripe Checkout Session (requires login)
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

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

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Learn mathematics with expert guidance",
            },
            unit_amount: Math.round(price * 100),
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

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("🔥 Error creating checkout session:", err.message);
    res.status(500).json({ error: `Failed to create checkout session: ${err.message}` });
  }
});

// ✅ Get course info for payment page
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        slug: course.slug,
      },
    });
  } catch (err) {
    console.error("Error fetching course for payment:", err);
    res.status(500).json({ error: "Failed to load course information" });
  }
});

export default router;
