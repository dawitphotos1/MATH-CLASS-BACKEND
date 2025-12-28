
// utils/sendEmail.js - COMPLETELY FIXED FOR YAHOO

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

await transporter.verify();

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Math Class Platform" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
