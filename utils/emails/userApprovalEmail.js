module.exports = (user) => {
  return {
    subject: "Your account has been approved",
    html: `<p>Hi ${user.name},</p>
           <p>Your account has been approved by an admin/teacher. You can now log in and access the platform.</p>`,
  };
};
