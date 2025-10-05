
// controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess } = db;

// ✅ Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    console.log("🔄 Creating checkout session for:", { 
      courseId, 
      userId: user.id 
    });

    // Validate course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      console.error("❌ Course not found:", courseId);
      return res.status(404).json({ error: "Course not found" });
    }

    // Check for existing enrollment
    const existingEnrollment = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existingEnrollment) {
      console.error("❌ User already enrolled:", { userId: user.id, courseId });
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    // Validate price
    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      console.error("❌ Invalid course price:", course.price);
      return res.status(400).json({ error: "Invalid course price" });
    }

    console.log("💳 Creating Stripe session for course:", course.title);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: course.title,
              description: course.description || "Mathematics course"
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email, // Pre-fill email for better UX
    });

    console.log("✅ Stripe session created:", session.id);

    // Create pending enrollment record
    await UserCourseAccess.create({
      user_id: user.id,
      course_id: courseId,
      payment_status: "pending",
      approval_status: "pending",
    });

    console.log("✅ Pending enrollment created for user:", user.id);

    res.json({ 
      success: true,
      sessionId: session.id 
    });

  } catch (error) {
    console.error("🔥 Create checkout session error:", error.message);
    res.status(500).json({ 
      success: false,
      error: "Failed to create checkout session" 
    });
  }
};

// ✅ Wrap with authentication middleware
export const createCheckoutSessionWithAuth = [authenticateToken, createCheckoutSession];

// ✅ Alternative: Export the function and apply middleware in routes
export default createCheckoutSession;