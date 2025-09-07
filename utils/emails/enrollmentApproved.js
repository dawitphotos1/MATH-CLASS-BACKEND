module.exports = (user, course) => {
  return {
    subject: `Enrollment Approved: ${course.title}`,
    html: `<p>Hi ${user.name},</p>
           <p>Your enrollment in <strong>${course.title}</strong> has been approved. You now have access to the course.</p>`,
  };
};
