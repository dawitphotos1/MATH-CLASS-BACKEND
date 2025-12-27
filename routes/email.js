
// // routes/email.js - SIMPLIFIED AND FIXED
// import express from 'express';
// import sendEmail, { sendEmailWithRetry } from '../utils/sendEmail.js';

// const router = express.Router();

// /**
//  * @route POST /api/v1/email/contact
//  * @description Handle contact form submissions
//  * @access Public
//  */
// router.post('/contact', async (req, res) => {
//   console.log('📧 Contact form submission received');
//   console.log('📝 Body:', req.body);

//   const { name, email, message } = req.body;

//   // Validation
//   if (!name || !email || !message) {
//     return res.status(400).json({
//       success: false,
//       error: 'Name, email, and message are required',
//     });
//   }

//   // Validate email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid email format',
//     });
//   }

//   try {
//     console.log('📤 Processing contact form submission...');
    
//     // 1. Send email to admin (you)
//     const adminEmailPromise = sendEmailWithRetry({
//       to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
//       subject: `📩 New Contact Message from ${name}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
//           <h2 style="color: #2c3e50;">📩 New Contact Message</h2>
//           <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
//             <p><strong>Name:</strong> ${name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
//           </div>
//           <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
//             <p><strong>Message:</strong></p>
//             <p style="white-space: pre-wrap;">${message}</p>
//           </div>
//           <p style="color: #7f8c8d; font-size: 14px;">
//             This message was sent from your Math Class Platform contact form.
//           </p>
//         </div>
//       `,
//     });

//     // 2. Send confirmation email to user
//     const userEmailPromise = sendEmailWithRetry({
//       to: email,
//       subject: '📬 Message Received - Math Class Platform',
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
//           <h2 style="color: #27ae60;">✅ Message Received!</h2>
//           <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
//             <p>Hi ${name},</p>
//             <p>Thank you for contacting <strong>Math Class Platform</strong>! We've received your message and will get back to you soon.</p>
//             <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
//               <h3 style="color: #3498db; margin-top: 0;">Your Message:</h3>
//               <p style="white-space: pre-wrap;">${message}</p>
//             </div>
//             <p>We typically respond within 24-48 hours.</p>
//             <p>Best regards,<br>The Math Class Platform Team</p>
//           </div>
//           <p style="color: #7f8c8d; font-size: 14px;">
//             This is an automated confirmation. Please do not reply to this email.
//           </p>
//         </div>
//       `,
//     });

//     // Wait for both emails to complete
//     const [adminResult, userResult] = await Promise.allSettled([
//       adminEmailPromise,
//       userEmailPromise,
//     ]);

//     // Check results
//     const adminSuccess = adminResult.status === 'fulfilled' && adminResult.value.success;
//     const userSuccess = userResult.status === 'fulfilled' && userResult.value.success;

//     console.log('📊 Email sending results:');
//     console.log('   Admin email:', adminSuccess ? '✅ Sent' : '❌ Failed');
//     console.log('   User email:', userSuccess ? '✅ Sent' : '❌ Failed');

//     // Return appropriate response
//     if (adminSuccess || userSuccess) {
//       const message = adminSuccess 
//         ? (userSuccess ? 'Message sent successfully! A confirmation has been sent to your email.' : 'Message sent successfully!')
//         : 'Message received but there was an issue sending notifications.';

//       return res.json({
//         success: true,
//         message: message,
//         timestamp: new Date().toISOString(),
//         emails: {
//           toAdmin: adminSuccess,
//           toUser: userSuccess,
//         },
//       });
//     } else {
//       throw new Error('Failed to send email notifications');
//     }

//   } catch (error) {
//     console.error('❌ Contact form processing error:', error.message);
//     console.error('❌ Error stack:', error.stack);

//     // Still return success to user but log the error
//     return res.json({
//       success: true,
//       message: 'Your message has been received. We will get back to you soon.',
//       note: 'There was a temporary issue with our notification system.',
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

// /**
//  * @route GET /api/v1/email/test
//  * @description Test email functionality
//  * @access Public
//  */
// router.get('/test', async (req, res) => {
//   try {
//     console.log('🧪 Testing email functionality...');

//     const testResult = await sendEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: '🧪 Email Test from Math Class Platform',
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px;">
//           <h2>🧪 Email Test</h2>
//           <p>This is a test email from your Math Class Platform.</p>
//           <p>If you receive this, email is working correctly! ✅</p>
//           <p>Time: ${new Date().toLocaleString()}</p>
//           <p>Server: ${process.env.BACKEND_URL}</p>
//         </div>
//       `,
//     });

//     res.json({
//       success: testResult.success,
//       message: testResult.success 
//         ? 'Test email sent successfully! Check your inbox.'
//         : 'Test email failed to send.',
//       result: testResult,
//       config: {
//         host: process.env.MAIL_HOST,
//         port: process.env.MAIL_PORT,
//         user: process.env.MAIL_USER,
//         from: process.env.EMAIL_FROM,
//       },
//     });
//   } catch (error) {
//     console.error('❌ Email test error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       stack: error.stack,
//     });
//   }
// });

// /**
//  * @route POST /api/v1/email/simple
//  * @description Simple email test endpoint
//  * @access Public
//  */
// router.post('/simple', async (req, res) => {
//   try {
//     const { to = process.env.ADMIN_EMAIL, subject = 'Test', message = 'Test message' } = req.body;

//     const result = await sendEmail({
//       to,
//       subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; padding: 20px;">
//           <h2>${subject}</h2>
//           <p>${message}</p>
//           <p>Time: ${new Date().toLocaleString()}</p>
//         </div>
//       `,
//     });

//     res.json({
//       success: result.success,
//       message: result.success ? 'Email sent successfully' : 'Failed to send email',
//       result,
//     });
//   } catch (error) {
//     console.error('❌ Simple email error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// export default router;






// routes/email.js - COMPLETE DEBUGGING VERSION
import express from 'express';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @route GET /api/v1/email/debug-config
 * @description Debug email configuration
 * @access Public
 */
router.get('/debug-config', async (req, res) => {
  try {
    console.log('🔍 Checking email configuration...');
    
    const config = {
      MAIL_HOST: process.env.MAIL_HOST || 'Not set',
      MAIL_PORT: process.env.MAIL_PORT || 'Not set',
      MAIL_USER: process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}...@...` : 'Not set',
      MAIL_PASS: process.env.MAIL_PASS ? '*****' + process.env.MAIL_PASS.substring(process.env.MAIL_PASS.length - 3) : 'Not set',
      EMAIL_FROM: process.env.EMAIL_FROM || 'Not set',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      BACKEND_URL: process.env.BACKEND_URL || 'Not set'
    };

    console.log('📧 Email Configuration:', config);

    res.json({
      success: true,
      config: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/email/contact
 * @description Handle contact form submissions
 * @access Public
 */
router.post('/contact', async (req, res) => {
  console.log('📞 Contact form submission received at:', new Date().toISOString());
  console.log('📞 Request body:', JSON.stringify(req.body, null, 2));
  
  // Log environment variables (masked for security)
  console.log('📞 Environment check:');
  console.log('- MAIL_HOST:', process.env.MAIL_HOST);
  console.log('- MAIL_PORT:', process.env.MAIL_PORT);
  console.log('- MAIL_USER:', process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}...` : 'Not set');
  console.log('- MAIL_PASS:', process.env.MAIL_PASS ? '*****' : 'Not set');
  console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('- NODE_ENV:', process.env.NODE_ENV);

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    console.error('❌ Missing fields in contact form');
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required',
      received: req.body
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format:', email);
    return res.status(400).json({
      success: false,
      error: 'Invalid email format',
      email: email
    });
  }

  try {
    console.log('📧 Starting email sending process...');
    console.log('📧 Admin email will be sent to:', process.env.ADMIN_EMAIL);
    console.log('📧 User confirmation will be sent to:', email);
    console.log('📧 Emails will be sent from:', process.env.EMAIL_FROM);

    // Test if sendEmail function exists
    if (typeof sendEmail !== 'function') {
      console.error('❌ sendEmail is not a function!');
      return res.status(500).json({
        success: false,
        error: 'Email service not properly configured'
      });
    }

    // Create email promises
    const promises = [];

    // 1. Send email to admin
    if (process.env.ADMIN_EMAIL) {
      console.log('📤 Sending admin notification to:', process.env.ADMIN_EMAIL);
      const adminPromise = sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `📧 New Contact Message from ${name}`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">📧 New Contact Message</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p><strong>👤 Name:</strong> ${name}</p>
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>📅 Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>🆔 User IP:</strong> ${req.ip}</p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <p><strong>💬 Message:</strong></p>
              <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; border-left: 4px solid #3498db;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
              This message was sent from your Math Class Platform contact form.
            </p>
          </div>
        </div>
        `,
      }).then(result => {
        console.log('✅ Admin email result:', result);
        return { type: 'admin', success: true, result };
      }).catch(error => {
        console.error('❌ Admin email failed:', error.message);
        console.error('❌ Error details:', error);
        return { type: 'admin', success: false, error: error.message };
      });
      promises.push(adminPromise);
    }

    // 2. Send confirmation email to user
    console.log('📤 Sending user confirmation to:', email);
    const userPromise = sendEmail({
      to: email,
      subject: '✅ Message Received - Math Class Platform',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
          <h2 style="color: #27ae60; margin-top: 0;">✅ Message Received!</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for contacting <strong style="color: #3498db;">Math Class Platform</strong>! We've received your message and will get back to you soon.</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #3498db; margin-top: 0;">📝 Your Message:</h3>
              <div style="background: white; padding: 10px; border-radius: 3px;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <p>We typically respond within <strong>24-48 hours</strong>.</p>
            <p>If you have any urgent questions, feel free to reply to this email.</p>
            <p style="margin-top: 20px;">
              Best regards,<br>
              <strong>The Math Class Platform Team</strong>
            </p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      </div>
      `,
    }).then(result => {
      console.log('✅ User email result:', result);
      return { type: 'user', success: true, result };
    }).catch(error => {
      console.error('❌ User email failed:', error.message);
      return { type: 'user', success: false, error: error.message };
    });
    promises.push(userPromise);

    // Execute all email sends
    console.log('⏳ Waiting for email sends to complete...');
    const results = await Promise.all(promises);
    console.log('📊 Email results:', results);

    // Analyze results
    const adminResult = results.find(r => r.type === 'admin');
    const userResult = results.find(r => r.type === 'user');
    
    const adminSuccess = adminResult ? adminResult.success : false;
    const userSuccess = userResult ? userResult.success : false;

    console.log('📊 Final summary:');
    console.log('   Admin email:', adminSuccess ? '✅ Sent' : '❌ Failed');
    console.log('   User email:', userSuccess ? '✅ Sent' : '❌ Failed');

    // Return response
    if (adminSuccess || userSuccess) {
      const response = {
        success: true,
        message: 'Your message has been received!',
        emails: {
          toAdmin: adminSuccess,
          toUser: userSuccess
        },
        timestamp: new Date().toISOString()
      };

      // Add debug info in development
      if (process.env.NODE_ENV === 'development') {
        response.debug = {
          adminResult,
          userResult,
          env: {
            MAIL_HOST: process.env.MAIL_HOST,
            EMAIL_FROM: process.env.EMAIL_FROM,
            ADMIN_EMAIL: process.env.ADMIN_EMAIL
          }
        };
      }

      return res.json(response);
    } else {
      // Both failed
      return res.status(500).json({
        success: false,
        error: 'Failed to send email notifications',
        details: {
          adminError: adminResult?.error,
          userError: userResult?.error
        },
        timestamp: new Date().toISOString()
      });
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    console.log('🧪 Starting email test...');
    console.log('🧪 Sending test to:', process.env.ADMIN_EMAIL);
    console.log('🧪 From:', process.env.EMAIL_FROM);
    
    const testResult = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: '🧪 Email Test from Math Class Platform',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center;">
            <h2 style="color: #3498db;">🧪 Email Test Successful!</h2>
            <p>This is a test email from your Math Class Platform.</p>
            <p>If you receive this, your email configuration is working correctly! ✅</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Server:</strong> ${process.env.BACKEND_URL}</p>
              <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
            </div>
            <p style="color: #27ae60; font-weight: bold;">🎉 Congratulations! Your email setup is working!</p>
          </div>
        </div>
      `,
    });

    console.log('🧪 Test result:', testResult);

    res.json({
      success: testResult.success,
      message: testResult.success 
        ? '✅ Test email sent successfully! Check your inbox.'
        : '❌ Test email failed to send.',
      result: testResult,
      config: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}...` : 'Not set',
        from: process.env.EMAIL_FROM,
        admin: process.env.ADMIN_EMAIL
      },
    });
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      config: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER ? 'Set' : 'Not set',
        pass: process.env.MAIL_PASS ? 'Set' : 'Not set',
        from: process.env.EMAIL_FROM
      }
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

    console.log('📤 Simple email test to:', to);

    const result = await sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Server:</strong> ${process.env.BACKEND_URL}</p>
        </div>
      `,
    });

    console.log('📤 Simple email result:', result);

    res.json({
      success: result.success,
      message: result.success ? '✅ Email sent successfully' : '❌ Failed to send email',
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