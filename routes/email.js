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
const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// POST /api/v1/email/contact
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email, and message are required.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true, // Yahoo requires SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_FROM}>`,
      to: process.env.MAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
    });

    console.log("✅ Email sent successfully");
    res.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
