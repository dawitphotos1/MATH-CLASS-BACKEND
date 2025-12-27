
// routes/testEmail.js - UPDATED
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Simple test without auth
router.get("/simple", async (req, res) => {
  try {
    console.log("🧪 Testing email configuration...");
    
    // Test SMTP connection
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP Connection verified");

    // Test sending
    const info = await transporter.sendMail({
      from: `"Math Class Test" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🧪 SMTP Test Email",
      text: "This is a test email to verify SMTP configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🧪 SMTP Test Email</h2>
          <p>This is a test email to verify SMTP configuration.</p>
          <p>If you receive this, your email setup is working correctly! ✅</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("✅ Test email sent:", info.messageId);

    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("❌ Full error:", error);
    
    res.status(500).json({
      success: false,
      error: "Test failed: " + error.message,
      details: error.stack,
    });
  }
});

// Test using sendEmail utility
router.get("/sendEmail-util", async (req, res) => {
  try {
    console.log("🧪 Testing sendEmail utility...");
    
    const sendEmail = (await import("../utils/sendEmail.js")).default;
    
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🧪 sendEmail Utility Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🧪 sendEmail Utility Test</h2>
          <p>This email tests the sendEmail utility function.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (result.success) {
      res.json({
        success: true,
        message: "sendEmail utility test passed",
        result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "sendEmail utility test failed",
        result,
      });
    }
  } catch (error) {
    console.error("❌ sendEmail utility test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;