
// routes/testEmail.js
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.MAIL_USER,
      subject: "✅ Yahoo SMTP Test from MathClass Backend",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Yahoo SMTP Test</h2>
          <p>This is a test email from your Math Class backend on Render.</p>
          <p>If you received this, email sending is now working ✅.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Test email sent successfully" });
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
