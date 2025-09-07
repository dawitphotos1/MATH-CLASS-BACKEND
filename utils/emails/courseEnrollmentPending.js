module.exports = function courseEnrollmentPending(user, course) {
  return {
    subject: `✅ Payment Received — ${course.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px;">
        <h2 style="color: #2d8a34;">Hello ${user.name},</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Thank you for your payment for <strong>${course.title}</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Your enrollment has been recorded and is currently 
          <strong style="color: #f39c12;">pending approval</strong> 
          by a teacher or administrator.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          You will be notified once your access has been approved.
        </p>
        <div style="margin-top: 25px;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; padding: 12px 24px; color: #fff; background-color: #2d8a34; text-decoration: none; border-radius: 5px;">
            Go to Login Page
          </a>
        </div>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 13px; color: #999;">
          — MathClass Team
        </p>
      </div>
    `,
  };
};
