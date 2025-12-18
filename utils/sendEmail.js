
// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  console.log("📧 Preparing email...");

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("MAIL_USER or MAIL_PASS missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.mail.yahoo.com",
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 5000,
    socketTimeout: 5000,
    greetingTimeout: 5000,
  });

  try {
    console.log("📧 Verifying SMTP connection...");
    await transporter.verify();

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", result.messageId);
    return result;

  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error; // IMPORTANT: let route catch it
  }
};

export default sendEmail;
