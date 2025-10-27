//routes/testEmail.js
import express from "express";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple email test without authentication
router.get("/test-simple", async (req, res) => {
  try {
    console.log("🧪 Testing simple email functionality...");

    // Dynamic import
    const sendEmail = (await import("../utils/sendEmail.js")).default;
    console.log("✅ Email module loaded");

    const testHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2>🧪 Test Email</h2>
        <p>This is a test email from your Math Class Platform.</p>
        <p>If you receive this, email is working! ✅</p>
        <p>Time: ${new Date().toISOString()}</p>
      </div>
    `;

    console.log("📧 Attempting to send test email...");

    const result = await sendEmail({
      to: "test@example.com", // Change this to a real email address you can check
      subject: "🧪 Test Email from Math Class Platform",
      html: testHtml,
    });

    console.log("✅ Test email sent successfully:", result);

    res.json({
      success: true,
      message: "Test email sent successfully",
      result,
    });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    console.error("❌ Full error:", error.stack);
    res.status(500).json({
      success: false,
      error: "Test email failed: " + error.message,
      stack: error.stack,
    });
  }
});

export default router;