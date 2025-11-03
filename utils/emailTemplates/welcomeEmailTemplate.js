// // utils/emailTemplates/welcomeEmailTemplate.js
// export const welcomeEmailTemplate = (studentName, frontendUrl) => `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>Welcome to MatheClass</title>
//   <style>
//     body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; }
//     .container { max-width: 600px; background: #ffffff; margin: 40px auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); overflow: hidden; }
//     .header { background-color: #2ecc71; color: white; text-align: center; padding: 24px; font-size: 24px; font-weight: bold; }
//     .content { padding: 32px; color: #333333; line-height: 1.6; }
//     .btn { display: inline-block; margin: 20px 0; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
//     .footer { background: #f2f4f6; color: #666; text-align: center; font-size: 12px; padding: 16px; }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">Welcome to MatheClass 🎓</div>
//     <div class="content">
//       <p>Dear <strong>${studentName || "Student"}</strong>,</p>
//       <p>We’re thrilled to welcome you to <b>MatheClass</b>! Your learning journey in mathematics starts here.</p>
//       <p>Access your dashboard, explore lessons, and begin your first course today.</p>
//       <a class="btn" href="${frontendUrl}/my-courses" target="_blank">View My Courses</a>
//       <p>If you ever need help, contact us anytime at <a href="mailto:support@matheclass.com">support@matheclass.com</a>.</p>
//       <p>Happy Learning!<br/>The MatheClass Team</p>
//     </div>
//     <div class="footer">
//       © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
//       <a href="${frontendUrl}" style="color:#2ecc71; text-decoration:none;">Visit Website</a>
//     </div>
//   </div>
// </body>
// </html>
// `;




export const welcomeEmailTemplate = (
  studentName = "Student",
  frontendUrl = "#"
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to MatheClass!</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f7fafc;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background: #3498db;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
      text-align: left;
      line-height: 1.6;
    }
    .content img {
      display: block;
      margin: 0 auto 20px;
      width: 120px;
      border-radius: 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 25px;
      background-color: #2ecc71;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 15px;
    }
    .footer {
      background: #f0f0f0;
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎉 Welcome to MatheClass!</h1>
    </div>
    <div class="content">
      <img src="https://mathe-class-website-backend-1.onrender.com/uploads/mathlogo2.jpg" alt="MatheClass Logo" />
      <h2>Welcome, ${studentName}!</h2>
      <p>We’re thrilled to have you on board. You can now explore courses and start learning immediately!</p>
      <p>
        <a href="${frontendUrl}/my-courses" class="button" target="_blank">View My Courses</a>
      </p>
      <p>If you need help, just email us at 
        <a href="mailto:support@matheclass.com">support@matheclass.com</a>.
      </p>
      <p>Happy learning,<br/>The <strong>MatheClass</strong> Team</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
      <a href="mailto:support@matheclass.com">support@matheclass.com</a>
    </div>
  </div>
</body>
</html>
`;
