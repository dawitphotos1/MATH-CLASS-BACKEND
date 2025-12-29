// // routes/test-email.js - Backend API routes for testing
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// /**
//  * GET /api/v1/test-email/config
//  * Check email configuration
//  */
// router.get("/config", (req, res) => {
//   const config = {
//     status: "Email service configured",
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     user: process.env.MAIL_USER
//       ? `${process.env.MAIL_USER.substring(0, 3)}...@...`
//       : "Not set",
//     adminEmail: process.env.ADMIN_EMAIL,
//     fromEmail: process.env.EMAIL_FROM,
//     enabled: process.env.EMAIL_ENABLED !== "false",
//     backendUrl: process.env.BACKEND_URL,
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//   };

//   res.json(config);
// });

// /**
//  * POST /api/v1/test-email
//  * Send a test email
//  */
// router.post("/", async (req, res) => {
//   const { to, subject, message } = req.body;

//   const testTo = to || process.env.ADMIN_EMAIL;

//   if (!testTo) {
//     return res.status(400).json({
//       success: false,
//       error: "No recipient specified and ADMIN_EMAIL not configured",
//     });
//   }

//   try {
//     const result = await sendEmail({
//       to: testTo,
//       subject: subject || "🧪 Test Email from Math Class Platform",
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2c3e50; text-align: center;">Test Email Received</h2>
//           <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
//             <p><strong>From:</strong> Math Class Platform</p>
//             <p><strong>To:</strong> ${testTo}</p>
//             <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
//             <p><strong>Backend:</strong> ${process.env.BACKEND_URL}</p>
//           </div>
//           <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
//             <p><strong>Message:</strong></p>
//             <p>${
//               message || "This is a test email to verify email configuration."
//             }</p>
//           </div>
//           <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//           <p style="text-align: center; color: #6c757d; font-size: 14px;">
//             ✅ If you received this, email is working correctly!
//           </p>
//         </div>
//       `,
//     });

//     res.json({
//       success: true,
//       message: "Test email attempted",
//       recipient: testTo,
//       result: result,
//       note: result.success
//         ? "Email sent successfully. Check your inbox (and spam folder)."
//         : "Email failed but app continues running. Check logs for details.",
//     });
//   } catch (error) {
//     console.error("Test email error:", error);
//     res.json({
//       success: false,
//       error: error.message,
//       note: "Email service failed but application continues running",
//       recipient: testTo,
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

// export default router;





// routes/test-email.js - Backend API routes for testing
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/**
 * GET /api/v1/test-email/config
 * Check email configuration
 */
router.get("/config", (req, res) => {
  const config = {
    status: "Email service configured",
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}...@...` : 'Not set',
    adminEmail: process.env.ADMIN_EMAIL,
    fromEmail: process.env.EMAIL_FROM,
    enabled: process.env.EMAIL_ENABLED !== "false",
    backendUrl: process.env.BACKEND_URL,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };
  
  res.json(config);
});

/**
 * POST /api/v1/test-email
 * Send a test email
 */
router.post("/", async (req, res) => {
  const { to, subject, message } = req.body;
  
  const testTo = to || process.env.ADMIN_EMAIL;
  
  if (!testTo) {
    return res.status(400).json({
      success: false,
      error: "No recipient specified and ADMIN_EMAIL not configured",
    });
  }
  
  try {
    const result = await sendEmail({
      to: testTo,
      subject: subject || "🧪 Test Email from Math Class Platform",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; text-align: center;">Test Email Received</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> Math Class Platform</p>
            <p><strong>To:</strong> ${testTo}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Backend:</strong> ${process.env.BACKEND_URL}</p>
          </div>
          <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p><strong>Message:</strong></p>
            <p>${message || 'This is a test email to verify email configuration.'}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="text-align: center; color: #6c757d; font-size: 14px;">
            ✅ If you received this, email is working correctly!
          </p>
        </div>
      `,
    });
    
    res.json({
      success: true,
      message: "Test email attempted",
      recipient: testTo,
      result: result,
      note: result.success 
        ? "Email sent successfully. Check your inbox (and spam folder)." 
        : "Email failed but app continues running. Check logs for details.",
    });
    
  } catch (error) {
    console.error("Test email error:", error);
    res.json({
      success: false,
      error: error.message,
      note: "Email service failed but application continues running",
      recipient: testTo,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;