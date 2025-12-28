
// routes/email.js - SIMPLIFIED AND FIXED
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/**
 * -------------------------------------------------------
 * POST /api/v1/email/contact
 * Handle Contact Us form
 * -------------------------------------------------------
 */
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email address",
    });
  }

  try {
    /* --------------------------------------------------
       1) Send email to ADMIN
    -------------------------------------------------- */
    const adminResult = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <pre>${message}</pre>
      `,
    });

    if (!adminResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to notify admin",
      });
    }

    /* --------------------------------------------------
       2) Send confirmation email to USER
    -------------------------------------------------- */
    await sendEmail({
      to: email,
      subject: "✅ We received your message",
      html: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for contacting <strong>Math Class Platform</strong>.</p>
        <p>We have received your message and will reply within 24–48 hours.</p>
        <hr />
        <p><strong>Your message:</strong></p>
        <pre>${message}</pre>
        <br />
        <p>— Math Class Platform Team</p>
      `,
    });

    return res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Contact email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

/**
 * -------------------------------------------------------
 * GET /api/v1/email/test
 * Simple email test
 * -------------------------------------------------------
 */
router.get("/test", async (req, res) => {
  try {
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🧪 Email Test",
      html: `
        <h2>Email Test Successful</h2>
        <p>If you received this email, SMTP is working.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Email test failed",
      });
    }

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("❌ Email test error:", error);
    res.status(500).json({
      success: false,
      error: "Email test failed",
    });
  }
});

/**
 * -------------------------------------------------------
 * POST /api/v1/email/simple
 * Manual test endpoint
 * -------------------------------------------------------
 */
router.post("/simple", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "to, subject, and message are required",
    });
  }

  try {
    const result = await sendEmail({
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
      });
    }

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("❌ Simple email error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
    });
  }
});

export default router;
