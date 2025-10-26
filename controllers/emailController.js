// // controllers/emailController.js
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";

// const { User } = db;

// /* ============================================================
//    ✉️ MANUAL Email Sending (Separate from approval)
// ============================================================ */
// export const sendApprovalEmail = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const student = await User.findByPk(studentId);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

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

//     await sendEmail({
//       to: student.email,
//       subject: "🎉 Your Math Class Account Has Been Approved!",
//       html: approvalHtml,
//     });

//     return res.json({
//       success: true,
//       message: `Approval email sent to ${student.email}`,
//     });
//   } catch (error) {
//     console.error("❌ Manual email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send email: " + error.message,
//     });
//   }
// };

// export const sendRejectionEmail = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const student = await User.findByPk(studentId);
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

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

//     await sendEmail({
//       to: student.email,
//       subject: "Math Class Platform - Account Not Approved",
//       html: rejectionHtml,
//     });

//     return res.json({
//       success: true,
//       message: `Rejection email sent to ${student.email}`,
//     });
//   } catch (error) {
//     console.error("❌ Manual email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send email: " + error.message,
//     });
//   }
// };




// controllers/emailController.js
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";

const { User } = db;

/* ============================================================
   ✉️ MANUAL Email Sending (Separate from approval)
============================================================ */
export const sendApprovalEmail = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

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

    await sendEmail({
      to: student.email,
      subject: "🎉 Your Math Class Account Has Been Approved!",
      html: approvalHtml,
    });

    return res.json({
      success: true,
      message: `Approval email sent to ${student.email}`
    });

  } catch (error) {
    console.error("❌ Manual email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send email: " + error.message
    });
  }
};

export const sendRejectionEmail = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

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

    await sendEmail({
      to: student.email,
      subject: "Math Class Platform - Account Not Approved",
      html: rejectionHtml,
    });

    return res.json({
      success: true,
      message: `Rejection email sent to ${student.email}`
    });

  } catch (error) {
    console.error("❌ Manual email error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send email: " + error.message
    });
  }
};