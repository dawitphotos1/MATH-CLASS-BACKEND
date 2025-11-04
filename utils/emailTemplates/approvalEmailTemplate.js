// // utils/emailTemplates/approvalEmailTemplate.js

// export const approvalEmailTemplate = (studentName) => {
//   const logoUrl = "https://math-class-platform.netlify.app/assets/images/mathlogo2.jpg";

//   return `
//   <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
//     <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
//       <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

//       <h2 style="color: #2ecc71;">🎉 Congratulations, ${studentName || "Student"}!</h2>
//       <p style="font-size: 16px; color: #333;">Your MatheClass student account has been <strong>approved</strong> by our admin team.</p>

//       <p style="font-size: 15px; color: #555; line-height: 1.6;">
//         You can now log in to your account and start learning immediately.
//       </p>

//       <a href="https://math-class-platform.netlify.app/login" 
//          style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
//         Go to My Courses
//       </a>

//       <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn’t create this account, please ignore this message.</p>

//       <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
//       <p style="font-size: 13px; color: #888;">
//         © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
//         <a href="https://math-class-platform.netlify.app" style="color: #2ecc71; text-decoration: none;">Visit our website</a>
//       </p>
//     </div>
//   </div>
//   `;
// };



// utils/emailTemplates/approvalEmailTemplate.js
export const approvalEmailTemplate = (name = "Student") => {
  const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MatheClass - Account Approved</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9fafb;
      color: #333;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      padding: 30px;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo img {
      width: 120px;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="logo">
      <img src="${logoUrl}" alt="MatheClass Logo" />
    </div>
    <h2>Hi ${name},</h2>
    <p>🎉 Congratulations! Your <strong>MatheClass</strong> student account has been approved.</p>
    <p>You can now log in and start learning today!</p>

    <a href="${process.env.FRONTEND_URL}/login" class="btn" target="_blank">Go to My Courses</a>

    <p>Thank you for choosing <strong>MatheClass</strong>!</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MatheClass. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
