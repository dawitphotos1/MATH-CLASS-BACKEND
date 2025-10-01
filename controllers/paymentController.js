
// controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UserCourseAccess, Course, User } = require("../models");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check existing enrollment
    const existingEnrollment = await UserCourseAccess.findOne({
      where: { user_id: user.id, course_id: courseId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: course.title },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/courses/${course.slug}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}/cancel`,
      metadata: { user_id: user.id, course_id: course.id },
    });

    await UserCourseAccess.create({
      user_id: user.id,
      course_id: courseId,
      payment_status: "pending",
      approval_status: "pending",
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("🔥 Create checkout session error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};
