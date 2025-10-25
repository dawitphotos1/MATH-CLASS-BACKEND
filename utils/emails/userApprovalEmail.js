
// utils/emails/userApprovalEmail.js
import jwt from "jsonwebtoken";

const userApprovalEmail = (user) => {
  const frontendURL =
    process.env.FRONTEND_URL || "https://math-class-platform.netlify.app";

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const confirmURL = `${frontendURL}/confirm-account?token=${token}`;

  return {
    subject: "🎉 Your Math Class Account Has Been Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.name},</h2>
        <p>Your account has been approved by an administrator.</p>
        <a href="${confirmURL}" 
           style="display:inline-block;margin-top:15px;padding:10px 20px;
           background:#2ecc71;color:#fff;text-decoration:none;border-radius:5px;">
           Confirm My Account
        </a>
      </div>
    `,
  };
};

export default userApprovalEmail;
