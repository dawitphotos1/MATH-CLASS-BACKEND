
// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.warn("⚠️ Email send skipped: missing parameters", { to, subject });
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};

export default sendEmail;
