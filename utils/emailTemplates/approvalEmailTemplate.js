// // utils/emailTemplates/approvalEmailTemplate.js
// export const approvalEmailTemplate = (
//   studentName = "Student",
//   frontendUrl = "#"
// ) => `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <title>Your MatheClass Account Has Been Approved!</title>
//   <style>
//     body {
//       font-family: 'Segoe UI', Arial, sans-serif;
//       background-color: #f5f7fa;
//       color: #333;
//       margin: 0;
//       padding: 0;
//     }
//     .email-container {
//       max-width: 600px;
//       margin: 40px auto;
//       background: #ffffff;
//       border-radius: 12px;
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
//       overflow: hidden;
//     }
//     .header {
//       background: #2ecc71;
//       color: white;
//       text-align: center;
//       padding: 20px;
//     }
//     .header h1 {
//       margin: 0;
//       font-size: 22px;
//       font-weight: 600;
//     }
//     .content {
//       padding: 30px 25px;
//       text-align: left;
//       line-height: 1.6;
//     }
//     .content img {
//       display: block;
//       margin: 0 auto 20px;
//       width: 120px;
//       border-radius: 8px;
//     }
//     .button {
//       display: inline-block;
//       padding: 12px 25px;
//       background-color: #3498db;
//       color: white;
//       text-decoration: none;
//       border-radius: 6px;
//       font-weight: 600;
//       margin-top: 15px;
//     }
//     .footer {
//       background: #f0f0f0;
//       text-align: center;
//       padding: 15px;
//       font-size: 12px;
//       color: #777;
//     }
//   </style>
// </head>
// <body>
//   <div class="email-container">
//     <div class="header">
//       <h1>✅ Account Approved!</h1>
//     </div>
//     <div class="content">
//       <img src="https://mathe-class-website-backend-1.onrender.com/uploads/mathlogo2.jpg" alt="MatheClass Logo" />
//       <h2>Hi ${studentName},</h2>
//       <p>🎉 Congratulations! Your <strong>MatheClass</strong> account has been approved by our admin team.</p>
//       <p>You can now log in and start learning.</p>
//       <p>
//         <a href="${frontendUrl}/login" class="button" target="_blank">Go to My Courses</a>
//       </p>
//       <p>Thank you for joining <strong>MatheClass</strong> — we’re excited to help you grow!</p>
//     </div>
//     <div class="footer">
//       &copy; ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
//       <a href="mailto:support@matheclass.com">support@matheclass.com</a>
//     </div>
//   </div>
// </body>
// </html>
// `;





// utils/emailTemplates/approvalEmailTemplate.js

export const approvalEmailTemplate = (studentName) => {
  const logoUrl = "https://math-class-platform.netlify.app/assets/images/mathlogo2.jpg";

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
      <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

      <h2 style="color: #2ecc71;">🎉 Congratulations, ${studentName || "Student"}!</h2>
      <p style="font-size: 16px; color: #333;">Your MatheClass student account has been <strong>approved</strong> by our admin team.</p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        You can now log in to your account and start learning immediately.
      </p>

      <a href="https://math-class-platform.netlify.app/login" 
         style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Go to My Courses
      </a>

      <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn’t create this account, please ignore this message.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
        <a href="https://math-class-platform.netlify.app" style="color: #2ecc71; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
  `;
};
