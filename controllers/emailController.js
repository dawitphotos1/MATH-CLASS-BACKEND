// // controllers/emailController.js
// import db from "../models/index.js";
// const { User } = db;

// /* ============================================================
//    ✉️ MANUAL EMAIL SENDING (Separate from approval process)
// ============================================================ */

// // Simple mock email function for immediate testing
// const mockSendEmail = async ({ to, subject, html }) => {
//   console.log("📧 [MOCK] Would send email to:", to);
//   console.log("📧 [MOCK] Subject:", subject);

//   // Simulate very short delay (100ms instead of 1000ms)
//   await new Promise((resolve) => setTimeout(resolve, 100));

//   return {
//     messageId: "mock-message-id",
//     response: "250 Mock email sent successfully",
//   };
// };

// // Use mock for now - replace with real email later
// const sendEmail = mockSendEmail;

// export const sendStudentApprovalEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(`📧 Manual approval email requested for student ID: ${id}`);

//     const student = await User.findByPk(id);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     console.log(`📧 Sending approval email to: ${student.email}`);

//     const approvalHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#28a745;">🎉 Account Approved!</h2>
//         <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
//           <p>Hello <strong>${student.name}</strong>,</p>
//           <p>Great news! Your Math Class Platform account has been approved.</p>
//           <p>You can now log in and access all available courses.</p>
//           <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">Happy Learning! 🎓</p>
//       </div>
//     `;

//     const emailResult = await sendEmail({
//       to: student.email,
//       subject: "🎉 Your Math Class Account Has Been Approved!",
//       html: approvalHtml,
//     });

//     console.log("✅ Manual approval email sent successfully");

//     return res.json({
//       success: true,
//       message: `Approval email sent to ${student.email}`,
//       emailResult,
//     });
//   } catch (error) {
//     console.error("❌ Manual approval email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send approval email: " + error.message,
//     });
//   }
// };

// export const sendStudentWelcomeEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(`📧 Manual welcome email requested for student ID: ${id}`);

//     const student = await User.findByPk(id);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     console.log(`📧 Sending welcome email to: ${student.email}`);

//     const welcomeHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#6f42c1;">🎓 Welcome to Math Class Platform!</h2>
//         <div style="background:white;padding:20px;border-radius:8px;margin:15px 0;">
//           <p>Hello <strong>${student.name}</strong>,</p>
//           <p>Welcome to our Math Class Platform! We're excited to have you join our learning community.</p>
          
//           <div style="background:#f0f8ff;padding:15px;border-radius:5px;margin:15px 0;">
//             <h3 style="color:#6f42c1;margin-top:0;">What's Next?</h3>
//             <ul style="margin-bottom:0;">
//               <li>📚 Explore available courses</li>
//               <li>🎥 Watch video lessons</li>
//               <li>📝 Complete practice exercises</li>
//               <li>📊 Track your progress</li>
//             </ul>
//           </div>
          
//           <p><strong>Get Started:</strong> <a href="${process.env.FRONTEND_URL}/courses" style="color:#6f42c1;font-weight:bold;">Browse Courses</a></p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">We're excited to help you achieve your math goals! 🚀</p>
//       </div>
//     `;

//     const emailResult = await sendEmail({
//       to: student.email,
//       subject: "🎓 Welcome to Math Class Platform!",
//       html: welcomeHtml,
//     });

//     console.log("✅ Manual welcome email sent successfully");

//     return res.json({
//       success: true,
//       message: `Welcome email sent to ${student.email}`,
//       emailResult,
//     });
//   } catch (error) {
//     console.error("❌ Manual welcome email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send welcome email: " + error.message,
//     });
//   }
// };

// export const sendStudentRejectionEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(`📧 Manual rejection email requested for student ID: ${id}`);

//     const student = await User.findByPk(id);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     console.log(`📧 Sending rejection email to: ${student.email}`);

//     const rejectionHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#dc3545;">Account Not Approved</h2>
//         <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
//           <p>Hello ${student.name},</p>
//           <p>We regret to inform you that your Math Class Platform account application has not been approved.</p>
//           <p>If you believe this is a mistake, please contact our support team.</p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">Thank you for your interest in our platform.</p>
//       </div>
//     `;

//     const emailResult = await sendEmail({
//       to: student.email,
//       subject: "Math Class Platform - Account Not Approved",
//       html: rejectionHtml,
//     });

//     console.log("✅ Manual rejection email sent successfully");

//     return res.json({
//       success: true,
//       message: `Rejection email sent to ${student.email}`,
//       emailResult,
//     });
//   } catch (error) {
//     console.error("❌ Manual rejection email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send rejection email: " + error.message,
//     });
//   }
// };





// controllers/emailController.js
import db from "../models/index.js";
const { User } = db;

/* ============================================================
   ✉️ MANUAL EMAIL SENDING (Separate from approval process)
============================================================ */

// Simple mock email function for immediate testing
const mockSendEmail = async ({ to, subject, html }) => {
  console.log('📧 [MOCK] Would send email to:', to);
  console.log('📧 [MOCK] Subject:', subject);
  
  // Simulate very short delay (100ms instead of 1000ms)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    messageId: 'mock-message-id',
    response: '250 Mock email sent successfully'
  };
};

// Use mock for now - replace with real email later
const sendEmail = mockSendEmail;

export const sendStudentApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📧 Manual approval email requested for student ID: ${id}`);
    
    const student = await User.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log(`📧 Sending approval email to: ${student.email}`);

    const approvalHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
        <h2 style="color:#28a745;">🎉 Account Approved!</h2>
        <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
          <p>Hello <strong>${student.name}</strong>,</p>
          <p>Great news! Your Math Class Platform account has been approved.</p>
          <p>You can now log in and access all available courses.</p>
          <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
        </div>
        <p style="color:#6c757d;font-size:14px;">Happy Learning! 🎓</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: student.email,
      subject: "🎉 Your Math Class Account Has Been Approved!",
      html: approvalHtml,
    });

    console.log("✅ Manual approval email sent successfully");

    return res.json({
      success: true,
      message: `Approval email sent to ${student.email}`,
      emailResult
    });

  } catch (error) {
    console.error("❌ Manual approval email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send approval email: " + error.message
    });
  }
};

export const sendStudentWelcomeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📧 Manual welcome email requested for student ID: ${id}`);
    
    const student = await User.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log(`📧 Sending welcome email to: ${student.email}`);

    const welcomeHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
        <h2 style="color:#6f42c1;">🎓 Welcome to Math Class Platform!</h2>
        <div style="background:white;padding:20px;border-radius:8px;margin:15px 0;">
          <p>Hello <strong>${student.name}</strong>,</p>
          <p>Welcome to our Math Class Platform! We're excited to have you join our learning community.</p>
          
          <div style="background:#f0f8ff;padding:15px;border-radius:5px;margin:15px 0;">
            <h3 style="color:#6f42c1;margin-top:0;">What's Next?</h3>
            <ul style="margin-bottom:0;">
              <li>📚 Explore available courses</li>
              <li>🎥 Watch video lessons</li>
              <li>📝 Complete practice exercises</li>
              <li>📊 Track your progress</li>
            </ul>
          </div>
          
          <p><strong>Get Started:</strong> <a href="${process.env.FRONTEND_URL}/courses" style="color:#6f42c1;font-weight:bold;">Browse Courses</a></p>
        </div>
        <p style="color:#6c757d;font-size:14px;">We're excited to help you achieve your math goals! 🚀</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: student.email,
      subject: "🎓 Welcome to Math Class Platform!",
      html: welcomeHtml,
    });

    console.log("✅ Manual welcome email sent successfully");

    return res.json({
      success: true,
      message: `Welcome email sent to ${student.email}`,
      emailResult
    });

  } catch (error) {
    console.error("❌ Manual welcome email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send welcome email: " + error.message
    });
  }
};

export const sendStudentRejectionEmail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📧 Manual rejection email requested for student ID: ${id}`);
    
    const student = await User.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    console.log(`📧 Sending rejection email to: ${student.email}`);

    const rejectionHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
        <h2 style="color:#dc3545;">Account Not Approved</h2>
        <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
          <p>Hello ${student.name},</p>
          <p>We regret to inform you that your Math Class Platform account application has not been approved.</p>
          <p>If you believe this is a mistake, please contact our support team.</p>
        </div>
        <p style="color:#6c757d;font-size:14px;">Thank you for your interest in our platform.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: student.email,
      subject: "Math Class Platform - Account Not Approved",
      html: rejectionHtml,
    });

    console.log("✅ Manual rejection email sent successfully");

    return res.json({
      success: true,
      message: `Rejection email sent to ${student.email}`,
      emailResult
    });

  } catch (error) {
    console.error("❌ Manual rejection email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send rejection email: " + error.message
    });
  }
};