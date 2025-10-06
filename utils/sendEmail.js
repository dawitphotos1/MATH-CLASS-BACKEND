
// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends an email and returns true if successful, false if failed.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - Email HTML content.
 * @returns {Promise<boolean>}
 */
const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.warn("❌ Email send skipped: missing parameters", {
      to,
      subject,
      html,
    });
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
    console.error("❌ Email sending failed (non-blocking):", error.message);
    return false;
  }
};

export default sendEmail;