module.exports = function enrollmentPendingAdmin(student, course) {
  return {
    subject: `🆕 Pending Enrollment: ${student.name} for ${course.title}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #fffbea; border: 1px solid #e2e2c5; border-radius: 8px;">
          <h2 style="color: #d35400;">New Enrollment Pending Approval</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            <strong>${student.name}</strong> has successfully paid for the course 
            <strong>${course.title}</strong> and is awaiting approval.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Please review and approve the enrollment in the admin dashboard.
          </p>
          <div style="margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL}/admin/pending-enrollments" 
               style="display: inline-block; padding: 12px 24px; color: #fff; background-color: #d35400; text-decoration: none; border-radius: 5px;">
              Review Enrollments
            </a>
          </div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 13px; color: #888;">
            — MathClass Admin Alert System
          </p>
        </div>
      `,
  };
};
