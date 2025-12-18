// routes/email.js
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and message are required",
    });
  }

  // ✅ Respond immediately
  res.status(200).json({
    success: true,
    message: "Message sent successfully!",
  });

  // 🔥 Send email in background (NEVER blocks)
  setImmediate(async () => {
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
  });
});

export default router;
