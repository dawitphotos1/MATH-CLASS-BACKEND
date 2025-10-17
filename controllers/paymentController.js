// controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, Enrollment, User } = db;

// ✅ Safe and consistent frontend URL fallback
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_BASE_URL ||
  "https://math-class-platform.netlify.app";

console.log("🌍 FRONTEND_URL in use:", FRONTEND_URL);

/* ============================================================
   📘 Get Course Info by ID (for PaymentPage.jsx)
============================================================ */
export const getCourseForPayment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching course for payment:", id);

    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
    });

    if (!course) {
      console.warn(`⚠️ Course not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    console.log(`✅ Course loaded for payment: ${course.title}`);

    // Ensure price is properly formatted
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: parseFloat(course.price),
      thumbnail: course.thumbnail,
    };

    res.json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    console.error("❌ getCourseForPayment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load course information",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   💳 Create Stripe Checkout Session - ENHANCED DUPLICATE PREVENTION
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    console.log("🧾 createCheckoutSession request:", {
      userId: user?.id,
      courseId,
    });

    if (!courseId || !user?.id) {
      return res.status(400).json({
        success: false,
        error: "Missing user or course ID",
      });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // 🧩 ENHANCED DUPLICATE PREVENTION - STRICT VERSION
    const existingEnrollment = await Enrollment.findOne({
      where: { 
        user_id: user.id, 
        course_id: courseId 
      },
    });

    console.log("🔍 Existing enrollment check:", {
      exists: !!existingEnrollment,
      payment_status: existingEnrollment?.payment_status,
      approval_status: existingEnrollment?.approval_status
    });

    if (existingEnrollment) {
      // 🚫 BLOCK if already paid and not rejected
      if (existingEnrollment.payment_status === "paid" && 
          existingEnrollment.approval_status !== "rejected") {
        console.log(`🚫 Blocking duplicate payment - Already paid: ${existingEnrollment.id}`);
        return res.status(400).json({
          success: false,
          error: "You have already paid for this course. You cannot purchase it again.",
          enrollmentId: existingEnrollment.id
        });
      }
      
      // 🚫 BLOCK if pending payment
      if (existingEnrollment.payment_status === "pending") {
        console.log(`🚫 Blocking duplicate payment - Pending: ${existingEnrollment.id}`);
        return res.status(400).json({
          success: false,
          error: "A payment for this course is already being processed. Please wait for it to complete.",
          enrollmentId: existingEnrollment.id
        });
      }

      // ✅ ALLOW retry only for failed/rejected enrollments
      if (existingEnrollment.payment_status === "failed" || 
          existingEnrollment.approval_status === "rejected") {
        console.log(`🔄 Allowing retry for failed/rejected enrollment: ${existingEnrollment.id}`);
        // We'll update this record in confirmPayment instead of creating new one
      } else {
        // 🚫 BLOCK all other cases
        console.log(`🚫 Blocking payment - Unexpected enrollment state:`, {
          id: existingEnrollment.id,
          payment_status: existingEnrollment.payment_status,
          approval_status: existingEnrollment.approval_status
        });
        return res.status(400).json({
          success: false,
          error: "You already have an enrollment record for this course. Please contact support.",
          enrollmentId: existingEnrollment.id
        });
      }
    }

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid course price",
      });
    }

    console.log(`💰 Creating Stripe session for "${course.title}" — $${price}`);

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
      success_url: `${FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel.html`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    console.log("✅ Stripe session created:", session.id);
    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("🔥 createCheckoutSession error:", error.stack || error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   ✅ Confirm Payment & Create/Update Enrollment - ENHANCED VERSION
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user?.id;

    console.log("🔁 Confirming payment:", { userId, courseId, sessionId });

    if (!sessionId || !courseId) {
      return res.status(400).json({
        success: false,
        error: "Missing IDs",
      });
    }
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed yet",
      });
    }

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course) {
      return res.status(404).json({
        success: false,
        error: "User or course not found",
      });
    }

    // 🧩 ENHANCED: Find or create enrollment with STRONG validation
    let enrollment;
    let created = false;
    
    try {
      // First try to find existing enrollment
      enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId }
      });

      if (enrollment) {
        // 🚫 DOUBLE CHECK: If already paid, block the confirmation
        if (enrollment.payment_status === "paid" && enrollment.approval_status !== "rejected") {
          console.log(`🚫 CONFIRMATION BLOCKED: Already paid enrollment: ${enrollment.id}`);
          return res.status(400).json({
            success: false,
            error: "This course has already been paid for. Duplicate payment detected.",
            enrollmentId: enrollment.id
          });
        }

        // Update existing enrollment
        enrollment.payment_status = "paid";
        enrollment.approval_status = "pending";
        await enrollment.save();
        console.log(`🔄 Updated existing enrollment: ${enrollment.id}`);
      } else {
        // Create new enrollment
        enrollment = await Enrollment.create({
          user_id: userId,
          course_id: courseId,
          payment_status: "paid",
          approval_status: "pending",
        });
        created = true;
        console.log(`✅ Created new enrollment: ${enrollment.id}`);
      }
    } catch (dbError) {
      console.error("❌ Database error creating enrollment:", dbError);
      
      // Handle unique constraint violation (double payment attempt)
      if (dbError.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: "Duplicate enrollment detected. This course has already been purchased.",
        });
      }
      
      return res.status(500).json({
        success: false,
        error: "Failed to create enrollment record",
      });
    }

    console.log(
      `🎓 Enrollment ${created ? "created" : "updated"} for ${user.email} in "${course.title}" - Payment: ${enrollment.payment_status}`
    );

    // 🧩 FINAL VERIFICATION: Check the enrollment was created properly
    const verifyEnrollment = await Enrollment.findByPk(enrollment.id);
    console.log("🔍 Final enrollment verification:", {
      id: verifyEnrollment?.id,
      payment_status: verifyEnrollment?.payment_status,
      approval_status: verifyEnrollment?.approval_status
    });

    res.json({
      success: true,
      message: "Payment confirmed — enrollment pending admin approval",
      enrollment: {
        id: enrollment.id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status
      },
    });
  } catch (error) {
    console.error("❌ confirmPayment error:", error.stack || error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};