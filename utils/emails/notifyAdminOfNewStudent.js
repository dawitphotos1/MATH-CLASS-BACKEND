// utils/emails/notifyAdminOfNewStudent.js

module.exports = function (studentName, studentEmail) {
  return {
    subject: "New Student Pending Approval",
    html: `
      <h3>Admin,</h3>
      <p>A new student has registered and is waiting for approval:</p>
      <ul>
        <li><strong>Name:</strong> ${studentName}</li>
        <li><strong>Email:</strong> ${studentEmail}</li>
      </ul>
      <p>Please review and approve them in the admin dashboard.</p>
    `,
  };
};
