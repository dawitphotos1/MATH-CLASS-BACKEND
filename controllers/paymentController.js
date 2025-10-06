
// // controllers/paymentController.js
// import stripePackage from "stripe";
// import db from "../models/index.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess } = db;

// // ✅ Create Stripe Checkout Session
// const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     console.log("🔄 Creating checkout session for:", { 
//       courseId, 
//       userId: user.id 
//     });

//     // Validate course exists
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       console.error("❌ Course not found:", courseId);
//       return res.status(404).json({ error: "Course not found" });
//     }

//     // Check for existing enrollment
//     const existingEnrollment = await UserCourseAccess.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });

//     if (existingEnrollment) {
//       console.error("❌ User already enrolled:", { userId: user.id, courseId });
//       return res.status(400).json({ error: "Already enrolled in this course" });
//     }

//     // Validate price
//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0) {
//       console.error("❌ Invalid course price:", course.price);
//       return res.status(400).json({ error: "Invalid course price" });
//     }

//     console.log("💳 Creating Stripe session for course:", course.title);

//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { 
//               name: course.title,
//               description: course.description || "Mathematics course"
//             },
//             unit_amount: Math.round(price * 100), // Convert to cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}`,
//       metadata: {
//         user_id: String(user.id),
//         course_id: String(course.id),
//       },
//       customer_email: user.email, // Pre-fill email for better UX
//     });

//     console.log("✅ Stripe session created:", session.id);

//     // Create pending enrollment record
//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: courseId,
//       payment_status: "pending",
//       approval_status: "pending",
//     });

//     console.log("✅ Pending enrollment created for user:", user.id);

//     res.json({ 
//       success: true,
//       sessionId: session.id 
//     });

//   } catch (error) {
//     console.error("🔥 Create checkout session error:", error.message);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to create checkout session" 
//     });
//   }
// };

// // ✅ Wrap with authentication middleware
// export const createCheckoutSessionWithAuth = [authenticateToken, createCheckoutSession];

// // ✅ Alternative: Export the function and apply middleware in routes
// export default createCheckoutSession;





// controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, Enrollment, User } = db;

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

// ✅ Confirm payment after successful checkout
export const confirmPayment = async (req, res) => {
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
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("✅ Stripe session retrieved:", session.id, "Status:", session.payment_status);
    } catch (stripeError) {
      console.error("❌ Stripe session retrieval error:", stripeError);
      return res.status(400).json({
        success: false,
        error: "Invalid payment session",
      });
    }

    if (session.payment_status !== "paid") {
      console.log("❌ Payment not completed, status:", session.payment_status);
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    // Get user and course details
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);

    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!course) {
      console.error("❌ Course not found:", courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    console.log("✅ User and course found:", user.email, course.title);

    // Check if enrollment already exists in UserCourseAccess
    const existingAccess = await UserCourseAccess.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    let enrollmentAccess;
    if (existingAccess) {
      // Update existing enrollment
      existingAccess.payment_status = "paid";
      existingAccess.approval_status = "approved";
      existingAccess.access_granted_at = new Date();
      await existingAccess.save();
      enrollmentAccess = existingAccess;
      console.log("✅ Updated existing enrollment access:", existingAccess.id);
    } else {
      // Create new enrollment access
      enrollmentAccess = await UserCourseAccess.create({
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
      console.log("✅ Updated existing enrollment record:", existingEnrollment.id);
    } else {
      await Enrollment.create({
        studentId: userId,
        courseId: courseId,
        approval_status: "approved",
      });
      console.log("✅ Created new enrollment record for user:", userId);
    }

    // ✅ SEND CONFIRMATION EMAIL
    try {
      console.log("📧 Sending enrollment confirmation email to:", user.email);
      const emailTemplate = courseEnrollmentApproved(user, course);
      const emailSent = await sendEmail(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );

      if (emailSent) {
        console.log("✅ Enrollment confirmation email sent successfully");
      } else {
        console.warn("⚠️ Email sending failed, but enrollment was successful");
      }
    } catch (emailError) {
      console.error("❌ Email sending error (non-blocking):", emailError);
      // Don't fail the enrollment if email fails
    }

    console.log("🎉 Payment confirmation completed successfully");

    res.json({
      success: true,
      message: "Payment confirmed and enrollment completed successfully",
      enrollment: {
        courseTitle: course.title,
        coursePrice: course.price,
        enrollmentDate: new Date().toISOString(),
        emailSent: true,
      },
    });

  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment and enrollment",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ Wrap with authentication middleware
export const createCheckoutSessionWithAuth = [authenticateToken, createCheckoutSession];

// ✅ Export functions
export { createCheckoutSession, confirmPayment };
export default createCheckoutSession;