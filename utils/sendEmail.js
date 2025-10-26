
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
    console.log('📧 Creating email transporter...');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });

    console.log('📧 Sending email to:', to);
    
    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;