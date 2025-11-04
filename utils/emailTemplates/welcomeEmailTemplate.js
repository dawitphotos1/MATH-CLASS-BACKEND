
// utils/emailTemplates/welcomeEmailTemplate.js
export const welcomeEmailTemplate = (name = "Student") => {
  const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to MatheClass</title>
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
      background-color: #10b981;
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
    <h2>Welcome, ${name}!</h2>
    <p>We’re thrilled to have you on board at <strong>MatheClass</strong> 🎓</p>
    <p>You can now explore our courses and start learning right away!</p>

    <a href="${process.env.FRONTEND_URL}/my-courses" class="btn" target="_blank">View My Courses</a>

    <p>If you have any questions, reach out anytime at
      <a href="mailto:support@matheclass.com">support@matheclass.com</a>.
    </p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MatheClass. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
