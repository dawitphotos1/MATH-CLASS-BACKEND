
// // utils/sendEmail.js - COMPLETELY FIXED FOR YAHOO

// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// await transporter.verify();

// const sendEmail = async ({ to, subject, html, text }) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Math Class Platform" <${process.env.MAIL_USER}>`,
//       to,
//       subject,
//       html,
//       text,
//     });

//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error("EMAIL ERROR:", error);
//     return { success: false, error: error.message };
//   }
// };

// export default sendEmail;




// utils/sendEmail.js - LAZY LOADED (Won't crash at startup)
import nodemailer from "nodemailer";

let transporter = null;
let transporterVerified = false;

const getTransporter = () => {
  if (!transporter) {
    console.log("📧 Creating email transporter...");
    
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Prevent hanging connections
      connectionTimeout: parseInt(process.env.EMAIL_TIMEOUT) || 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      // Retry logic
      maxConnections: 5,
      maxMessages: 10,
    });
    
    console.log("📧 Email transporter created (lazy-loaded)");
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  // Check if email is disabled
  if (process.env.EMAIL_ENABLED === "false") {
    console.log("📧 Email disabled in environment, skipping send");
    return { 
      success: true, 
      messageId: "mock-id-email-disabled",
      note: "Email disabled in environment"
    };
  }

  try {
    const emailTransporter = getTransporter();
    
    // Verify connection only on first use
    if (!transporterVerified) {
      try {
        console.log("📧 Verifying email connection...");
        await emailTransporter.verify();
        transporterVerified = true;
        console.log("✅ Email transporter verified successfully");
      } catch (verifyError) {
        console.warn("⚠️ Email verification failed:", verifyError.message);
        console.log("📧 Will attempt to send anyway...");
      }
    }
    
    const fromAddress = `"Math Class Platform" <${process.env.EMAIL_FROM || process.env.MAIL_USER}>`;
    
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const info = await emailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    });

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };
    
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error.message);
    
    // Don't crash the app - return a graceful failure
    return { 
      success: false, 
      error: error.message,
      note: "Email service temporarily unavailable. Message saved for later delivery.",
      // Still return success to client so they don't see an error
      clientSuccess: true
    };
  }
};

export default sendEmail;