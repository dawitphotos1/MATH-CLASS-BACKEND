// // utils/emailTemplates/enrollmentApprovalEmailTemplate.js
// export const enrollmentApprovalEmailTemplate = (
//   name = "Student",
//   courseTitle = "your course"
// ) => {
//   const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>MatheClass - Enrollment Approved</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       background-color: #f9fafb;
//       color: #333;
//       padding: 20px;
//     }
//     .email-container {
//       max-width: 600px;
//       margin: auto;
//       background: #ffffff;
//       border-radius: 12px;
//       box-shadow: 0 4px 10px rgba(0,0,0,0.05);
//       padding: 30px;
//     }
//     .logo {
//       text-align: center;
//       margin-bottom: 20px;
//     }
//     .logo img {
//       width: 120px;
//     }
//     .btn {
//       display: inline-block;
//       padding: 10px 20px;
//       background-color: #2563eb;
//       color: #fff;
//       text-decoration: none;
//       border-radius: 6px;
//       margin-top: 20px;
//     }
//     .footer {
//       margin-top: 30px;
//       text-align: center;
//       font-size: 12px;
//       color: #888;
//     }
//   </style>
// </head>
// <body>
//   <div class="email-container">
//     <div class="logo">
//       <img src="${logoUrl}" alt="MatheClass Logo" />
//     </div>

//     <h2>Hi ${name},</h2>
//     <p>🎉 Great news! Your enrollment in <strong>${courseTitle}</strong> has been <strong>approved</strong>.</p>
//     <p>You now have full access to all course materials, exercises, and lessons.</p>

//     <a href="${
//       process.env.FRONTEND_URL
//     }/my-courses" class="btn" target="_blank">Go to My Courses</a>

//     <p>We’re excited to see your progress and help you master new skills!</p>

//     <div class="footer">
//       <p>&copy; ${new Date().getFullYear()} MatheClass. All rights reserved.</p>
//     </div>
//   </div>
// </body>
// </html>
// `;
// };






// utils/emailTemplates/enrollmentApprovalEmailTemplate.js
export const enrollmentApprovalEmailTemplate = (name = "Student", courseTitle = "your course") => {
  const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MatheClass - Enrollment Approved</title>
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
    <p>🎉 Great news! Your enrollment in <strong>${courseTitle}</strong> has been <strong>approved</strong>.</p>
    <p>You now have full access to all course materials, exercises, and lessons.</p>

    <a href="${process.env.FRONTEND_URL}/my-courses" class="btn" target="_blank">Go to My Courses</a>

    <p>We’re excited to see your progress and help you master new skills!</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MatheClass. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
