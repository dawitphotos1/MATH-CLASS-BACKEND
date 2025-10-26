
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
  console.log("🔧 SMTP Configuration:", {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    from: process.env.EMAIL_FROM,
    to: to
  });

  // Validate environment variables
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    const error = "❌ Missing email environment variables: MAIL_HOST, MAIL_USER, or MAIL_PASS";
    console.error(error);
    throw new Error(error);
  }

  try {
    // Yahoo-specific configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT) || 465,
      secure: true, // Yahoo requires SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Yahoo-specific settings
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      },
      // Connection pool settings
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    console.log("🔄 Verifying SMTP connection...");
    
    // Test connection
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    const mailOptions = {
      from: `"Math Class Platform" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      html: html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log("📤 Sending email to:", to);
    console.log("📝 Subject:", subject);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("📫 Message ID:", info.messageId);
    console.log("👤 Recipient:", to);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error("❌ Email sending failed!");
    console.error("🔍 Error Details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });

    let userFriendlyError = "Failed to send email";
    
    if (error.code === 'EAUTH') {
      userFriendlyError = "Email authentication failed. Please check your Yahoo email credentials and ensure you're using an App Password.";
    } else if (error.code === 'ECONNECTION') {
      userFriendlyError = "Cannot connect to Yahoo mail server. Please check your internet connection.";
    } else if (error.code === 'ETIMEDOUT') {
      userFriendlyError = "Email connection timed out. Please try again.";
    } else if (error.responseCode === 535) {
      userFriendlyError = "Yahoo authentication failed. Please use an App Password instead of your regular password.";
    }

    throw new Error(userFriendlyError);
  }
};

export default sendEmail;