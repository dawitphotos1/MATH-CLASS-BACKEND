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

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required.",
    });
  }

  // ✅ RESPOND IMMEDIATELY
  res.status(200).json({
    success: true,
    message: "Message received successfully!",
  });

  // 🔥 SEND EMAIL IN BACKGROUND (NO BLOCKING)
  (async () => {
    try {
      await sendEmail({
        to: process.env.MAIL_USER,
        subject: `📩 New Contact Message from ${name}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
      console.log("✅ Contact email sent");
    } catch (err) {
      console.error("❌ Background email failed:", err.message);
    }
  })();
});

export default router;
