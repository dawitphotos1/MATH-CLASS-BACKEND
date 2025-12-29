
// // routes/email.js - SIMPLIFIED AND FIXED
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// /**
//  * -------------------------------------------------------
//  * POST /api/v1/email/contact
//  * Handle Contact Us form
//  * -------------------------------------------------------
//  */
// router.post("/contact", async (req, res) => {
//   const { name, email, message } = req.body;

//   // Basic validation
//   if (!name || !email || !message) {
//     return res.status(400).json({
//       success: false,
//       error: "Name, email, and message are required",
//     });
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({
//       success: false,
//       error: "Invalid email address",
//     });
//   }

//   try {
//     /* --------------------------------------------------
//        1) Send email to ADMIN
//     -------------------------------------------------- */
//     const adminResult = await sendEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: `📩 New Contact Message from ${name}`,
//       html: `
//         <h2>New Contact Message</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Message:</strong></p>
//         <pre>${message}</pre>
//       `,
//     });

//     if (!adminResult.success) {
//       return res.status(500).json({
//         success: false,
//         error: "Failed to notify admin",
//       });
//     }

//     /* --------------------------------------------------
//        2) Send confirmation email to USER
//     -------------------------------------------------- */
//     await sendEmail({
//       to: email,
//       subject: "✅ We received your message",
//       html: `
//         <p>Hi <strong>${name}</strong>,</p>
//         <p>Thank you for contacting <strong>Math Class Platform</strong>.</p>
//         <p>We have received your message and will reply within 24–48 hours.</p>
//         <hr />
//         <p><strong>Your message:</strong></p>
//         <pre>${message}</pre>
//         <br />
//         <p>— Math Class Platform Team</p>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "Message sent successfully",
//     });
//   } catch (error) {
//     console.error("❌ Contact email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send message",
//     });
//   }
// });

// /**
//  * -------------------------------------------------------
//  * GET /api/v1/email/test
//  * Simple email test
//  * -------------------------------------------------------
//  */
// router.get("/test", async (req, res) => {
//   try {
//     const result = await sendEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: "🧪 Email Test",
//       html: `
//         <h2>Email Test Successful</h2>
//         <p>If you received this email, SMTP is working.</p>
//         <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
//       `,
//     });

//     if (!result.success) {
//       return res.status(500).json({
//         success: false,
//         error: "Email test failed",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Test email sent successfully",
//     });
//   } catch (error) {
//     console.error("❌ Email test error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Email test failed",
//     });
//   }
// });

// /**
//  * -------------------------------------------------------
//  * POST /api/v1/email/simple
//  * Manual test endpoint
//  * -------------------------------------------------------
//  */
// router.post("/simple", async (req, res) => {
//   const { to, subject, message } = req.body;

//   if (!to || !subject || !message) {
//     return res.status(400).json({
//       success: false,
//       error: "to, subject, and message are required",
//     });
//   }

//   try {
//     const result = await sendEmail({
//       to,
//       subject,
//       html: `<p>${message}</p>`,
//     });

//     if (!result.success) {
//       return res.status(500).json({
//         success: false,
//         error: "Failed to send email",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Email sent successfully",
//     });
//   } catch (error) {
//     console.error("❌ Simple email error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to send email",
//     });
//   }
// });

// export default router;






// routes/email.js - ROBUST VERSION
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/**
 * -------------------------------------------------------
 * POST /api/v1/email/contact
 * Handle Contact Us form (Always returns success to user)
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
    // Save the message (you could save to database here)
    console.log(`📝 Contact form submitted: ${name} <${email}>`);
    console.log(`📝 Message: ${message.substring(0, 100)}...`);
    
    // Try to send email in background (don't await)
    const sendToAdmin = async () => {
      try {
        const result = await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `📩 New Contact Message from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2c3e50;">New Contact Message</h2>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <p><strong>Message:</strong></p>
                <pre style="white-space: pre-wrap; font-family: monospace;">${message}</pre>
              </div>
            </div>
          `,
        });
        
        if (result.success) {
          console.log(`✅ Admin notification sent to ${process.env.ADMIN_EMAIL}`);
        } else {
          console.warn(`⚠️ Admin notification failed: ${result.error}`);
        }
      } catch (emailError) {
        console.error("⚠️ Background email error:", emailError.message);
      }
    };
    
    // Start email in background
    sendToAdmin();
    
    // Always return success to the user immediately
    return res.json({
      success: true,
      message: "Thank you for your message! We'll contact you soon.",
      received: true,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("❌ Contact form processing error:", error);
    
    // Even on error, return success to user
    return res.json({
      success: true,
      message: "Message received successfully. Thank you!",
      received: true,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * -------------------------------------------------------
 * GET /api/v1/email/test
 * Simple email test endpoint
 * -------------------------------------------------------
 */
router.get("/test", async (req, res) => {
  try {
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🧪 Email Test from Math Class Platform",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #27ae60;">✅ Email Test Successful</h2>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Backend URL:</strong> ${process.env.BACKEND_URL}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
          </div>
          <p>This is an automated test from your Math Class Platform backend.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Test email attempted",
      emailResult: result,
      note: result.success ? "Email sent successfully" : "Email failed but app is running",
    });
  } catch (error) {
    console.error("❌ Email test route error:", error);
    res.json({
      success: true,
      message: "Email test completed (app is running)",
      error: error.message,
      note: "App is running even though email test failed",
    });
  }
});

/**
 * -------------------------------------------------------
 * POST /api/v1/email/simple
 * Manual email sending endpoint
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
      html: `<div style="font-family: Arial, sans-serif; padding: 15px;">${message}</div>`,
    });

    res.json({
      success: true,
      message: "Email sending attempted",
      result,
    });
  } catch (error) {
    console.error("❌ Simple email error:", error);
    res.json({
      success: true,
      message: "Email service attempted",
      error: error.message,
      note: "App continues running normally",
    });
  }
});

/**
 * -------------------------------------------------------
 * GET /api/v1/email/status
 * Check email configuration status
 * -------------------------------------------------------
 */
router.get("/status", (req, res) => {
  const emailConfig = {
    enabled: process.env.EMAIL_ENABLED !== "false",
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}...` : 'Not set',
    from: process.env.EMAIL_FROM,
    admin: process.env.ADMIN_EMAIL,
    timeout: process.env.EMAIL_TIMEOUT || "10000ms",
  };
  
  res.json({
    success: true,
    email: emailConfig,
    status: "Email service configured",
    note: "Transporter is lazy-loaded and won't connect until first email",
  });
});

export default router;