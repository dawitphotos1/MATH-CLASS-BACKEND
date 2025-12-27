
// // utils/sendEmail.js
// import nodemailer from "nodemailer";

// const sendEmail = async ({ to, subject, html }) => {
//   console.log("📧 Preparing email...");

//   if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
//     throw new Error("MAIL_USER or MAIL_PASS missing");
//   }

//   const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST || "smtp.mail.yahoo.com",
//     port: Number(process.env.MAIL_PORT) || 465,
//     secure: true,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//     connectionTimeout: 5000,
//     socketTimeout: 5000,
//     greetingTimeout: 5000,
//   });

//   try {
//     console.log("📧 Verifying SMTP connection...");
//     await transporter.verify();

//     const result = await transporter.sendMail({
//       from: process.env.EMAIL_FROM || process.env.MAIL_USER,
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent:", result.messageId);
//     return result;

//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     throw error; // IMPORTANT: let route catch it
//   }
// };

// export default sendEmail;




// utils/sendEmail.js - COMPLETELY FIXED FOR YAHOO
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Email Configuration Check:');
console.log('   MAIL_HOST:', process.env.MAIL_HOST);
console.log('   MAIL_PORT:', process.env.MAIL_PORT);
console.log('   MAIL_USER:', process.env.MAIL_USER);
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

// Create transporter with better Yahoo configuration
const createTransporter = () => {
  try {
    console.log('🔧 Creating email transporter for Yahoo...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mail.yahoo.com',
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false, // Yahoo uses STARTTLS on port 587
      requireTLS: true, // Yahoo requires TLS
      tls: {
        rejectUnauthorized: false, // For self-signed certificates if needed
        ciphers: 'SSLv3'
      },
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      debug: true, // Enable debug output
      logger: true, // Enable logging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 30000, // 30 seconds
    });

    console.log('✅ Transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create transporter:', error.message);
    throw error;
  }
};

// Verify transporter connection
const verifyTransporter = async (transporter) => {
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    console.error('❌ Error details:', error);
    return false;
  }
};

/**
 * Send email with robust error handling
 * @param {Object} emailOptions - Email configuration
 * @param {string} emailOptions.to - Recipient email
 * @param {string} emailOptions.subject - Email subject
 * @param {string} emailOptions.html - HTML content
 * @param {string} emailOptions.text - Plain text content (optional)
 * @returns {Promise<Object>} Result object
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
  const startTime = Date.now();
  console.log(`📧 Starting email send to: ${to}`);
  console.log(`📧 Subject: ${subject}`);

  if (!to || !subject || (!html && !text)) {
    const error = new Error('Missing required email parameters');
    console.error('❌ Validation error:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Missing required parameters',
    };
  }

  let transporter;
  try {
    // Create transporter
    transporter = createTransporter();
    
    // Verify connection
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      throw new Error('SMTP connection verification failed');
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_SENDER || `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
      headers: {
        'X-Mailer': 'Math Class Platform',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
      },
    };

    console.log('📤 Sending email...');
    
    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out after 30 seconds')), 30000);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Email sent successfully in ${elapsedTime}ms`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted}`);
    console.log(`   Rejected: ${info.rejected}`);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      elapsedTime,
    };
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   To:', to);
    console.error('   Subject:', subject);
    
    // Log specific Yahoo errors
    if (error.code === 'EAUTH') {
      console.error('   🔐 Authentication failed - check Yahoo app password');
    } else if (error.code === 'ECONNECTION') {
      console.error('   🔌 Connection failed - check network/port');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⏱️ Connection timed out - Yahoo server busy');
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      message: `Failed to send email: ${error.message}`,
    };
  } finally {
    // Close transporter if it exists
    if (transporter) {
      try {
        transporter.close();
        console.log('🔒 Transporter closed');
      } catch (closeError) {
        console.warn('⚠️ Failed to close transporter:', closeError.message);
      }
    }
  }
};

/**
 * Send email with retry logic
 * @param {Object} emailOptions - Email configuration
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Result object
 */
const sendEmailWithRetry = async (emailOptions, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxRetries} to send email to ${emailOptions.to}`);
    
    const result = await sendEmail(emailOptions);
    
    if (result.success) {
      console.log(`✅ Email sent successfully on attempt ${attempt}`);
      return result;
    }
    
    lastError = result;
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏱️ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`❌ Failed to send email after ${maxRetries} attempts`);
  return lastError;
};

// Export functions
export default sendEmail;
export { sendEmailWithRetry, createTransporter, verifyTransporter };