// //utils/emails/userApprovalEmail.js
// module.exports = (user) => {
//   return {
//     subject: "Your account has been approved",
//     html: `<p>Hi ${user.name},</p>
//            <p>Your account has been approved by an admin/teacher. You can now log in and access the platform.</p>`,
//   };
// };




// utils/emails/userApprovalEmail.js
import jwt from "jsonwebtoken";

export default (user) => {
  const frontendURL =
    process.env.FRONTEND_URL || "https://math-class-platform.netlify.app";

  // Create confirmation token valid for 24 hours
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const confirmURL = `${frontendURL}/confirm-account?token=${token}`;

  return {
    subject: "🎉 Your Math Class Account Has Been Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <h2 style="color: #2ecc71;">Hi ${user.name},</h2>
        <p>Your Math Class account has been approved by an administrator.</p>
        <p>Please confirm your email address by clicking below:</p>
        <a href="${confirmURL}" 
           style="display:inline-block;margin-top:15px;padding:10px 20px;
           background:#2ecc71;color:#fff;text-decoration:none;border-radius:5px;">
           Confirm My Account
        </a>
        <p style="margin-top:30px;font-size:0.9em;color:#555;">
          This link will expire in 24 hours. Once confirmed, you can log in and start learning!
        </p>
      </div>
    `,
  };
};
