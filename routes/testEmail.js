// // routes/testEmail.js
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// router.get("/test-email", async (req, res) => {
//   try {
//     await sendEmail({
//       to: "yourpersonalemail@example.com",
//       subject: "✅ Test Email from Math Class",
//       html: "<p>This is a test email from your backend.</p>",
//     });
//     res.json({ success: true, message: "Email sent successfully!" });
//   } catch (err) {
//     console.error("❌ Email test failed:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// export default router;





// routes/testEmail.js
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "greenw2025@yahoo.com",
      subject: "✅ Test Email from Math Class",
      html: "<p>This is a test email from your backend.</p>",
    });
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Email test failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
