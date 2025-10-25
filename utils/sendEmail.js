
// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  console.log("📨 Preparing to send email...");
  console.log("SMTP CONFIG:", {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    from: process.env.EMAIL_FROM,
  });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    console.log("🕓 Connecting to SMTP server...");

    // Verify connection before sending
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.messageId);
    console.log("📬 Preview (if test account):", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("❌ Email sending failed!");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full stack:", err.stack);
    throw err;
  }
};

export default sendEmail;
