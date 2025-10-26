// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// router.get("/test", async (req, res) => {
//   try {
//     await sendEmail({
//       to: process.env.MAIL_USER,
//       subject: "✅ Yahoo SMTP Test from MathClass Backend",
//       html: "<p>If you got this email, your SMTP setup works! 🎉</p>",
//     });
//     res.json({ success: true, message: "Test email sent successfully" });
//   } catch (err) {
//     console.error("❌ Test email failed:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// export default router;




import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.MAIL_USER,
      subject: "✅ Yahoo SMTP Test from MathClass Backend",
      html: "<p>If you got this email, your SMTP setup works! 🎉</p>",
    });
    res.json({ success: true, message: "Test email sent successfully" });
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
