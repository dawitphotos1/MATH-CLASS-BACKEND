module.exports = (user, course) => {
  return {
    subject: `Enrollment Approved: ${course.title}`,
    text: `Hi ${user.name},\n\nYour enrollment in the course "${course.title}" has been approved!\n\nHappy learning!`,
    html: `<p>Hi ${user.name},</p><p>Your enrollment in <strong>${course.title}</strong> has been approved!</p><p>Happy learning!</p>`,
  };
};
