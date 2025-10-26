
// // routes/testEmail.js
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// /* ============================================================
//    ✉️ Test Email Endpoint
// ============================================================ */
// router.post("/", async (req, res) => {
//   try {
//     const { to, subject, message } = req.body;

//     if (!to || !subject || !message) {
//       return res.status(400).json({
//         success: false,
//         error: "Missing required fields: to, subject, message"
//       });
//     }

//     console.log("🧪 Testing email configuration...");
//     console.log("📧 Test Email Details:", { to, subject, message });

//     const testHtml = `
//       <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;">
//         <h2 style="color: #28a745;">✅ Math Class Platform - Test Email</h2>
//         <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
//           <p><strong>Subject:</strong> ${subject}</p>
//           <p><strong>Message:</strong> ${message}</p>
//           <p><strong>Sent At:</strong> ${new Date().toLocaleString()}</p>
//           <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
//         </div>
//         <p style="color: #6c757d; font-size: 14px;">
//           This is a test email from your Math Class Platform backend.
//           If you received this, your email configuration is working correctly! 🎉
//         </p>
//         <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
//         <p style="color: #6c757d; font-size: 12px; text-align: center;">
//           Math Class Platform - Automated Test
//         </p>
//       </div>
//     `;

//     const result = await sendEmail({
//       to: to,
//       subject: subject,
//       html: testHtml
//     });

//     console.log("✅ Test email sent successfully:", result);

//     res.json({
//       success: true,
//       message: "Test email sent successfully!",
//       details: {
//         to: to,
//         subject: subject,
//         messageId: result.messageId,
//         timestamp: new Date().toISOString()
//       }
//     });

//   } catch (error) {
//     console.error("❌ Test email failed:", error);
    
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       details: {
//         suggestion: "Check your Yahoo App Password and SMTP settings",
//         required: "MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS environment variables"
//       }
//     });
//   }
// });

// /* ============================================================
//    🔧 Email Configuration Check
// ============================================================ */
// router.get("/config", (req, res) => {
//   const config = {
//     MAIL_HOST: process.env.MAIL_HOST ? "✅ Set" : "❌ Missing",
//     MAIL_PORT: process.env.MAIL_PORT ? "✅ Set" : "❌ Missing", 
//     MAIL_USER: process.env.MAIL_USER ? "✅ Set" : "❌ Missing",
//     MAIL_PASS: process.env.MAIL_PASS ? "✅ Set" : "❌ Missing",
//     EMAIL_FROM: process.env.EMAIL_FROM ? "✅ Set" : "❌ Missing",
//     NODE_ENV: process.env.NODE_ENV || "development"
//   };

//   console.log("🔧 Email Configuration Check:", config);

//   res.json({
//     success: true,
//     config: config,
//     suggestions: [
//       "Use Yahoo App Password (not regular password)",
//       "Enable 2-factor authentication in Yahoo account",
//       "Check environment variables are loaded correctly"
//     ]
//   });
// });

// export default router;



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