
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
