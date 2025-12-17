// //routes/email.js
// const express = require("express");
// const nodemailer = require("nodemailer");
// const router = express.Router();

// // POST /api/v1/email/contact
// router.post("/contact", async (req, res) => {
//   const { name, email, message } = req.body;

//   if (!email || !message || !name) {
//     return res
//       .status(400)
//       .json({ error: "Name, email, and message are required." });
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: true, // ✅ Yahoo requires SSL
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"${name}" <${process.env.EMAIL_FROM}>`,
//       to: process.env.MAIL_USER, // Sends to yourself (your Yahoo inbox)
//       subject: `New Contact Form Message from ${name}`,
//       text: `You received a new message from the contact form:\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}`,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Message sent: %s", info.messageId);
//     res.status(200).json({ message: "Message sent successfully!" });
//   } catch (error) {
//     console.error("❌ Email error:", error);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// });

// module.exports = router;


// routes/email.js
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/**
 * POST /api/v1/email/contact
 * Public contact form endpoint
 */
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required.",
    });
  }

  try {
    // Protect against SMTP hangs (Yahoo / Render)
    await Promise.race([
      sendEmail({
        to: process.env.MAIL_USER,
        subject: `📩 New Contact Message from ${name}`,
        html: `
          <h3>New Contact Form Message</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout exceeded")), 8000)
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("❌ Contact email failed:", error.message);

    // IMPORTANT: never hang the request
    return res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
});

export default router;
