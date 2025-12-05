// controllers/paymentController.js
import Stripe from "stripe";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";

// Initialize Stripe with proper error handling
let stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error("❌ Stripe initialization failed:", error.message);
  throw new Error("Stripe initialization failed");
}

const { Course, Enrollment, User, Payment } = db;

// Determine FRONTEND_URL with priority order
const FRONTEND_URL = 
  process.env.FRONTEND_URL || 
  process.env.FRONTEND_BASE_URL || 
  "https://math-class-platform.netlify.app";

console.log("🌍 Payment Controller - FRONTEND_URL:", FRONTEND_URL);

/* ============================================================
   📘 Get Course Info by ID (used by PaymentPage.jsx)
============================================================ */
export const getPaymentByCourseId = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const priceValue = parseFloat(course.price) || 0;
    console.log(`💰 getPaymentByCourseId → ID: ${id}, PRICE: $${priceValue}`);

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: priceValue,
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error("❌ getPaymentByCourseId error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load course details" 
    });
  }
};

/* ============================================================
   💳 Create Stripe Checkout Session (Only Students)
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    // Validation
    if (!user || user.role !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can make course payments.",
      });
    }

    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing course ID" 
      });
    }

    // Get course details
    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "description", "price"],
      raw: true,
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      });
    }

    const price = Number(course.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid course price" 
      });
    }

    // Check for existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      where: { 
        user_id: user.id, 
        course_id: courseId 
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.payment_status === "paid" && 
          existingEnrollment.approval_status !== "rejected") {
        return res.status(400).json({
          success: false,
          error: "You have already paid for this course.",
        });
      }
      
      if (existingEnrollment.payment_status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Payment already in process. Please wait for confirmation.",
        });
      }
    }

    // Create Stripe checkout session
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
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
        user_email: user.email,
        course_title: course.title,
      },
      customer_email: user.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    });

    // Save pending payment record
    await Payment.create({
      user_id: user.id,
      course_id: course.id,
      stripe_session_id: session.id,
      amount: price,
      status: "pending",
      currency: "usd",
    });

    console.log(`✅ Checkout session created: ${session.id} for user ${user.email}`);

    res.json({ 
      success: true, 
      sessionId: session.id, 
      url: session.url,
      message: "Checkout session created successfully"
    });
  } catch (error) {
    console.error("🔥 createCheckoutSession error:", error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: "Invalid payment request",
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ============================================================
   ✅ Confirm Payment (Frontend Fallback)
============================================================ */
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, courseId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validation
    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        error: "Only students can confirm payments.",
      });
    }

    if (!sessionId || !courseId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing session ID or course ID" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }

    // Verify Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ 
        success: false, 
        error: "Payment not completed yet" 
      });
    }

    // Verify metadata matches
    if (session.metadata?.user_id !== String(userId) || 
        session.metadata?.course_id !== String(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Session does not match user or course"
      });
    }

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course) {
      return res.status(404).json({ 
        success: false, 
        error: "User or course not found" 
      });
    }

    // Update or create enrollment
    let enrollment = await Enrollment.findOne({
      where: { 
        user_id: userId, 
        course_id: courseId 
      },
    });

    if (enrollment) {
      enrollment.payment_status = "paid";
      enrollment.approval_status = "pending";
      enrollment.enrolled_at = new Date();
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "pending",
        enrolled_at: new Date(),
      });
    }

    // Update payment record
    await Payment.update(
      { 
        status: "paid",
        paid_at: new Date()
      },
      { 
        where: { 
          stripe_session_id: sessionId,
          user_id: userId 
        } 
      }
    );

    // Notify Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `💰 New Payment: ${user.name} paid for ${course.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h2 style="color: #2c3e50;">📚 New Payment Received</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>👤 Student:</strong> ${user.name} (${user.email})</p>
                <p><strong>📖 Course:</strong> ${course.title}</p>
                <p><strong>💰 Amount:</strong> $${course.price}</p>
                <p><strong>📅 Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>🔑 Session ID:</strong> ${sessionId}</p>
              </div>
              <p><strong>Status:</strong> <span style="color: #e74c3c;">Paid - Pending Admin Approval</span></p>
              <br/>
              <a href="${FRONTEND_URL}/admin/enrollments" 
                 style="display: inline-block; padding: 12px 24px; background-color: #3498db; 
                        color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 👨‍🏫 Review in Admin Dashboard
              </a>
            </div>
          `,
        });
        console.log(`📧 Admin notified of payment from ${user.email}`);
      }
    } catch (emailError) {
      console.warn("⚠️ Failed to send admin payment alert:", emailError.message);
    }

    res.json({
      success: true,
      message: "Payment confirmed — awaiting admin approval.",
      enrollment: {
        id: enrollment.id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        enrolled_at: enrollment.enrolled_at,
      },
    });
  } catch (error) {
    console.error("❌ confirmPayment error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to confirm payment",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/* ============================================================
   📩 Stripe Webhook Handler
============================================================ */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
    return res.status(400).send("Webhook secret not configured");
  }

  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object);
      break;
    case 'payment_intent.succeeded':
      console.log(`💰 Payment succeeded: ${event.data.object.id}`);
      break;
    default:
      console.log(`⚡ Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

/* ============================================================
   🛠️ Webhook Helper Functions
============================================================ */

async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;
    const userEmail = session.metadata?.user_email;
    const courseTitle = session.metadata?.course_title;

    if (!userId || !courseId) {
      console.warn("⚠️ Webhook missing metadata:", session.id);
      return;
    }

    console.log(`✅ Processing webhook for session: ${session.id}`);

    const [user, course] = await Promise.all([
      User.findByPk(userId),
      Course.findByPk(courseId),
    ]);

    if (!user || !course) {
      console.error("❌ Webhook: User or course not found");
      return;
    }

    // Create or update enrollment
    const existingEnrollment = await Enrollment.findOne({
      where: { 
        user_id: userId, 
        course_id: courseId 
      },
    });

    if (existingEnrollment) {
      existingEnrollment.payment_status = "paid";
      existingEnrollment.approval_status = "pending";
      existingEnrollment.enrolled_at = new Date();
      await existingEnrollment.save();
      console.log(`📝 Updated existing enrollment for user ${userId}`);
    } else {
      await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        payment_status: "paid",
        approval_status: "pending",
        enrolled_at: new Date(),
      });
      console.log(`📝 Created new enrollment for user ${userId}`);
    }

    // Update payment record
    await Payment.update(
      { 
        status: "paid",
        paid_at: new Date()
      },
      { 
        where: { 
          stripe_session_id: session.id,
          user_id: userId 
        } 
      }
    );

    console.log(`✅ Webhook processed: user ${userId}, course ${courseId}`);

    // Notify Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `💰 Webhook: New Payment - ${userEmail || user.email}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h2 style="color: #27ae60;">⚡ Stripe Webhook Payment</h2>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>👤 Student:</strong> ${user.name} (${user.email})</p>
                <p><strong>📖 Course:</strong> ${courseTitle || course.title}</p>
                <p><strong>💰 Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                <p><strong>📅 Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>🔑 Session ID:</strong> ${session.id}</p>
              </div>
              <p><strong>Status:</strong> <span style="color: #e74c3c;">Auto-processed via Webhook</span></p>
              <br/>
              <a href="${FRONTEND_URL}/admin/enrollments" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2ecc71; 
                        color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 📊 View in Admin Panel
              </a>
            </div>
          `,
        });
        console.log(`📧 Admin notified via webhook for payment by ${user.email}`);
      }
    } catch (emailError) {
      console.warn("⚠️ Webhook: Failed to send admin alert:", emailError.message);
    }

  } catch (error) {
    console.error("🔥 handleCheckoutSessionCompleted error:", error);
  }
}

async function handleCheckoutSessionExpired(session) {
  try {
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;

    if (userId && courseId) {
      // Update payment status to expired
      await Payment.update(
        { status: "expired" },
        { 
          where: { 
            stripe_session_id: session.id,
            user_id: userId 
          } 
        }
      );
      
      console.log(`⏰ Session expired: ${session.id}`);
    }
  } catch (error) {
    console.error("❌ handleCheckoutSessionExpired error:", error);
  }
}