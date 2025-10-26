
// // utils/sendEmail.js
// import nodemailer from "nodemailer";

// const sendEmail = async ({ to, subject, html }) => {
//   console.log("📨 Preparing to send email...");
//   console.log("SMTP CONFIG:", {
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     user: process.env.MAIL_USER,
//     from: process.env.EMAIL_FROM,
//   });

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: Number(process.env.MAIL_PORT) || 465,
//       secure: true, // Yahoo and Gmail require SSL
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false, // ✅ Fix for Render + Yahoo SSL
//       },
//     });

//     console.log("🕓 Connecting to SMTP server...");
//     await transporter.verify();
//     console.log("✅ SMTP connection verified successfully");

//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("📧 Email sent successfully:", info.messageId);
//     return info;
//   } catch (err) {
//     console.error("❌ Email sending failed!");
//     console.error("Error name:", err.name);
//     console.error("Error message:", err.message);
//     console.error("Full stack:", err.stack);
//     throw err;
//   }
// };

// export default sendEmail;

// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('📧 Creating Yahoo Mail transporter...');
    
    // Check if email credentials exist
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('Yahoo Mail credentials are missing. Check MAIL_USER and MAIL_PASS environment variables.');
    }

    console.log('📧 Yahoo Mail user:', process.env.MAIL_USER);
    
    // Create Yahoo Mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mail.yahoo.com',
      port: process.env.MAIL_PORT || 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    console.log('📧 Sending email to:', to);
    
    // Verify connection first
    await transporter.verify();
    console.log('✅ Yahoo Mail server connection verified');

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    });

    console.log('✅ Yahoo Mail sent successfully. Message ID:', result.messageId);
    console.log('✅ Response:', result.response);
    
    return result;
    
  } catch (error) {
    console.error('❌ Yahoo Mail sending failed:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    // More specific error messages for Yahoo
    if (error.code === 'EAUTH') {
      throw new Error('Yahoo Mail authentication failed. Check your email credentials and App Password.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Cannot connect to Yahoo Mail. Check your network connection.');
    }
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;