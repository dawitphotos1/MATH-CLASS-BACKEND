module.exports = (user, course) => {
  return {
    subject: `Enrollment Rejected: ${course.title}`,
    html: `<p>Hi ${user.name},</p>
           <p>Unfortunately, your enrollment in <strong>${course.title}</strong> has been rejected. If you have questions, please contact support.</p>`,
  };
};
