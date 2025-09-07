module.exports = (user, course) => {
  return {
    subject: `Enrollment Rejected for ${course.title}`,
    html: `
      <h2>Enrollment Rejected</h2>
      <p>Dear ${user.name},</p>
      <p>We regret to inform you that your enrollment for "${course.title}" has been rejected.</p>
      <p>Please contact support for more information.</p>
      <p>Thank you for your understanding.</p>
    `,
  };
};
