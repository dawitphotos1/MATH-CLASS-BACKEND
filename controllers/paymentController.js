// //controllers/paymentController.js
// import stripePackage from "stripe";
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

// const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
// const { Course, UserCourseAccess, Enrollment, User } = db;

// // ✅ Create Stripe Checkout Session
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const user = req.user;

//     if (!courseId || !user?.id) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing user or course ID" });
//     }

//     const course = await Course.findByPk(courseId);
//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     // Prevent duplicate enrollments
//     const existing = await UserCourseAccess.findOne({
//       where: { user_id: user.id, course_id: courseId },
//     });
//     if (existing)
//       return res
//         .status(400)
//         .json({ success: false, error: "Already enrolled in this course" });

//     const price = parseFloat(course.price);
//     if (isNaN(price) || price <= 0)
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid course price" });

//     // ✅ Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: course.title,
//               description: course.description || "Mathematics course",
//             },
//             unit_amount: Math.round(price * 100),
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
//       customer_email: user.email,
//     });

//     // ✅ Create pending access record
//     await UserCourseAccess.create({
//       user_id: user.id,
//       course_id: course.id,
//       payment_status: "pending",
//       approval_status: "pending",
//     });

//     console.log("✅ Stripe session created:", session.id);
//     res.json({ success: true, sessionId: session.id, url: session.url });
//   } catch (error) {
//     console.error("🔥 Checkout session error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to create checkout session",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// // ✅ Confirm Payment (after successful checkout)
// export const confirmPayment = async (req, res) => {
//   try {
//     const { sessionId, session_id, courseId, course_id } = req.body;
//     const sid = sessionId || session_id;
//     const cid = courseId || course_id;
//     const userId = req.user?.id;

//     if (!sid || !cid) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Missing session or course ID" });
//     }

//     if (!userId) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: Missing user token" });
//     }

//     // Retrieve session
//     const session = await stripe.checkout.sessions.retrieve(sid);
//     if (!session)
//       return res
//         .status(400)
//         .json({ success: false, error: "Invalid Stripe session" });

//     if (session.payment_status !== "paid") {
//       return res
//         .status(400)
//         .json({ success: false, error: "Payment not completed yet" });
//     }

//     const user = await User.findByPk(userId);
//     const course = await Course.findByPk(cid);
//     if (!user || !course)
//       return res
//         .status(404)
//         .json({ success: false, error: "User or course not found" });

//     // ✅ Update enrollment
//     const [access] = await UserCourseAccess.findOrCreate({
//       where: { user_id: userId, course_id: cid },
//       defaults: {
//         payment_status: "paid",
//         approval_status: "approved",
//         access_granted_at: new Date(),
//       },
//     });

//     if (access.payment_status !== "paid") {
//       access.payment_status = "paid";
//       access.approval_status = "approved";
//       access.access_granted_at = new Date();
//       await access.save();
//     }

//     // ✅ Sync enrollment table
//     const [enrollment] = await Enrollment.findOrCreate({
//       where: { studentId: userId, courseId: cid },
//       defaults: { approval_status: "approved" },
//     });
//     if (enrollment.approval_status !== "approved") {
//       enrollment.approval_status = "approved";
//       await enrollment.save();
//     }

//     // ✅ Send confirmation email
//     try {
//       const emailTemplate = courseEnrollmentApproved(user, course);
//       await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
//       console.log("📧 Confirmation email sent to:", user.email);
//     } catch (err) {
//       console.warn("⚠️ Email send failed:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Payment confirmed and enrollment successful",
//       enrollment: {
//         courseTitle: course.title,
//         price: course.price,
//         enrollmentDate: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Payment confirmation error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to confirm payment",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };


//controllers/paymentController.js
import stripePackage from "stripe";
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const { Course, UserCourseAccess, Enrollment, User } = db;

// ✅ Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    if (!courseId || !user?.id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing user or course ID" });
    }

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    // Prevent duplicate enrollments
    const existing = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, error: "Already enrolled in this course" });

    const price = parseFloat(course.price);
    if (isNaN(price) || price <= 0)
      return res
        .status(400)
        .json({ success: false, error: "Invalid course price" });

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description || "Mathematics course",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // ⚠️ UPDATED: Changed to static HTML files
      success_url: `https://math-class-platform.netlify.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
      cancel_url: `https://math-class-platform.netlify.app/payment-cancel.html`,
      metadata: {
        user_id: String(user.id),
        course_id: String(course.id),
      },
      customer_email: user.email,
    });

    // ✅ Create pending access record
    await UserCourseAccess.create({
      user_id: user.id,
      course_id: course.id,
      payment_status: "pending",
      approval_status: "pending",
    });

    console.log("✅ Stripe session created:", session.id);
    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("🔥 Checkout session error:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// In confirmPayment function - fix the enrollment creation
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId, session_id, courseId, course_id } = req.body;
    const sid = sessionId || session_id;
    const cid = courseId || course_id;
    const userId = req.user?.id;

    if (!sid || !cid) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing session or course ID" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized: Missing user token" 
      });
    }

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (!session) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid Stripe session" 
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ 
        success: false, 
        error: "Payment not completed yet" 
      });
    }

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(cid);
    
    if (!user || !course) {
      return res.status(404).json({ 
        success: false, 
        error: "User or course not found" 
      });
    }

    // ✅ Update UserCourseAccess
    const [access] = await UserCourseAccess.findOrCreate({
      where: { user_id: userId, course_id: cid },
      defaults: {
        payment_status: "paid",
        approval_status: "approved",
        access_granted_at: new Date(),
      },
    });

    if (access.payment_status !== "paid") {
      access.payment_status = "paid";
      access.approval_status = "approved";
      access.access_granted_at = new Date();
      await access.save();
    }

    // ✅ Sync Enrollment table with correct field names
    const [enrollment] = await Enrollment.findOrCreate({
      where: { user_id: userId, course_id: cid }, // Fixed field names
      defaults: { 
        approval_status: "approved",
        payment_status: "paid"
      },
    });

    if (enrollment.approval_status !== "approved" || enrollment.payment_status !== "paid") {
      enrollment.approval_status = "approved";
      enrollment.payment_status = "paid";
      await enrollment.save();
    }

    // ✅ Send confirmation email
    try {
      const emailTemplate = courseEnrollmentApproved(user, course);
      await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
      console.log("📧 Confirmation email sent to:", user.email);
    } catch (err) {
      console.warn("⚠️ Email send failed:", err.message);
    }

    res.json({
      success: true,
      message: "Payment confirmed and enrollment successful",
      enrollment: {
        courseTitle: course.title,
        price: course.price,
        enrollmentDate: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};