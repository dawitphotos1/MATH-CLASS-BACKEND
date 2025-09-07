module.exports = (user, token) => ({
  subject: "🔐 Password Reset Request",
  html: `
    <p>Hello ${user.name},</p>
    <p>To reset your password, click the link below:</p>
    <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `,
});
