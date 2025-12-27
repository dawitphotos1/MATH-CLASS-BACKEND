// // routes/email.js
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// router.post("/contact", (req, res) => {
//   const { name, email, message } = req.body;

//   if (!name || !email || !message) {
//     return res.status(400).json({
//       success: false,
//       error: "Name, email, and message are required",
//     });
//   }

//   // ✅ Respond immediately
//   res.status(200).json({
//     success: true,
//     message: "Message sent successfully!",
//   });

//   // 🔥 Send email in background (NEVER blocks)
//   setImmediate(async () => {
//     try {
//       await sendEmail({
//         to: process.env.MAIL_USER,
//         subject: `📩 New Contact Message from ${name}`,
//         html: `
//           <p><strong>Name:</strong> ${name}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Message:</strong></p>
//           <p>${message}</p>
//         `,
//       });
//       console.log("✅ Contact email sent");
//     } catch (err) {
//       console.error("❌ Background email failed:", err.message);
//     }
//   });
// });

// export default router;





// routes/email.js - SIMPLIFIED AND FIXED
import express from 'express';
import sendEmail, { sendEmailWithRetry } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @route POST /api/v1/email/contact
 * @description Handle contact form submissions
 * @access Public
 */
router.post('/contact', async (req, res) => {
  console.log('📧 Contact form submission received');
  console.log('📝 Body:', req.body);

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
    });
  }

  try {
    console.log('📤 Processing contact form submission...');
    
    // 1. Send email to admin (you)
    const adminEmailPromise = sendEmailWithRetry({
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h2 style="color: #2c3e50;">📩 New Contact Message</h2>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            This message was sent from your Math Class Platform contact form.
          </p>
        </div>
      `,
    });

    // 2. Send confirmation email to user
    const userEmailPromise = sendEmailWithRetry({
      to: email,
      subject: '📬 Message Received - Math Class Platform',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h2 style="color: #27ae60;">✅ Message Received!</h2>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
            <p>Hi ${name},</p>
            <p>Thank you for contacting <strong>Math Class Platform</strong>! We've received your message and will get back to you soon.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #3498db; margin-top: 0;">Your Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p>We typically respond within 24-48 hours.</p>
            <p>Best regards,<br>The Math Class Platform Team</p>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    // Wait for both emails to complete
    const [adminResult, userResult] = await Promise.allSettled([
      adminEmailPromise,
      userEmailPromise,
    ]);

    // Check results
    const adminSuccess = adminResult.status === 'fulfilled' && adminResult.value.success;
    const userSuccess = userResult.status === 'fulfilled' && userResult.value.success;

    console.log('📊 Email sending results:');
    console.log('   Admin email:', adminSuccess ? '✅ Sent' : '❌ Failed');
    console.log('   User email:', userSuccess ? '✅ Sent' : '❌ Failed');

    // Return appropriate response
    if (adminSuccess || userSuccess) {
      const message = adminSuccess 
        ? (userSuccess ? 'Message sent successfully! A confirmation has been sent to your email.' : 'Message sent successfully!')
        : 'Message received but there was an issue sending notifications.';

      return res.json({
        success: true,
        message: message,
        timestamp: new Date().toISOString(),
        emails: {
          toAdmin: adminSuccess,
          toUser: userSuccess,
        },
      });
    } else {
      throw new Error('Failed to send email notifications');
    }

  } catch (error) {
    console.error('❌ Contact form processing error:', error.message);
    console.error('❌ Error stack:', error.stack);

    // Still return success to user but log the error
    return res.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
      note: 'There was a temporary issue with our notification system.',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /api/v1/email/test
 * @description Test email functionality
 * @access Public
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing email functionality...');

    const testResult = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: '🧪 Email Test from Math Class Platform',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🧪 Email Test</h2>
          <p>This is a test email from your Math Class Platform.</p>
          <p>If you receive this, email is working correctly! ✅</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>Server: ${process.env.BACKEND_URL}</p>
        </div>
      `,
    });

    res.json({
      success: testResult.success,
      message: testResult.success 
        ? 'Test email sent successfully! Check your inbox.'
        : 'Test email failed to send.',
      result: testResult,
      config: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        from: process.env.EMAIL_FROM,
      },
    });
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

/**
 * @route POST /api/v1/email/simple
 * @description Simple email test endpoint
 * @access Public
 */
router.post('/simple', async (req, res) => {
  try {
    const { to = process.env.ADMIN_EMAIL, subject = 'Test', message = 'Test message' } = req.body;

    const result = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.json({
      success: result.success,
      message: result.success ? 'Email sent successfully' : 'Failed to send email',
      result,
    });
  } catch (error) {
    console.error('❌ Simple email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;