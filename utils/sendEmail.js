
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
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  console.log("📨 Preparing to send email...");
  
  // Validate environment variables
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    const error = "❌ Missing email environment variables";
    console.error(error);
    throw new Error(error);
  }

  try {
    // Simplified transporter - no pooling for better reliability
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Reduced timeout for faster failure
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("🔄 Testing SMTP connection...");
    
    // Quick connection test
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const mailOptions = {
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      html: html,
    };

    console.log("📤 Sending email to:", to);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("📫 Message ID:", info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    
    // Simplified error handling
    let userFriendlyError = "Failed to send email";
    
    if (error.code === 'EAUTH') {
      userFriendlyError = "Email authentication failed";
    } else if (error.code === 'ECONNECTION') {
      userFriendlyError = "Cannot connect to email server";
    }

    throw new Error(userFriendlyError);
  }
};

export default sendEmail;