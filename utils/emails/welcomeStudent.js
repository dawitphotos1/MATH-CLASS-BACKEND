// utils/emails/welcomeStudent.js

module.exports = function (studentName) {
  return {
    subject: "Welcome to the Math Class!",
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Welcome to the Math Class Website. Your registration was successful and is pending approval.</p>
      <p>We’re excited to have you on board!</p>
      <p>Best regards,<br/>The Math Class Team</p>
    `,
  };
};
