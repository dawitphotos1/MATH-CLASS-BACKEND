// // routes/email.js
// import express from "express";
// import sendEmail from "../utils/sendEmail.js";

// const router = express.Router();

// router.post("/contact", async (req, res) => {
//   const { name, email, message } = req.body;

//   if (!name || !email || !message) {
//     return res.status(400).json({
//       success: false,
//       error: "Name, email, and message are required.",
//     });
//   }

//   // ✅ RESPOND IMMEDIATELY
//   res.status(200).json({
//     success: true,
//     message: "Message received successfully!",
//   });

//   // 🔥 SEND EMAIL IN BACKGROUND (NO BLOCKING)
//   (async () => {
//     try {
//       await sendEmail({
//         to: process.env.MAIL_USER,
//         subject: `📩 New Contact Message from ${name}`,
//         html: `
//           <p><strong>Name:</strong> ${name}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Message:</strong></p>
//           <p>${message}</p>
//         `,
//       });
//       console.log("✅ Contact email sent");
//     } catch (err) {
//       console.error("❌ Background email failed:", err.message);
//     }
//   })();
// });

// export default router;





// routes/email.js
import express from "express";

const router = express.Router();

router.post("/contact", (req, res) => {
  console.log("🔥 CONTACT ROUTE HIT — RESPONSE SENT");
  return res.status(200).json({
    success: true,
    message: "Contact endpoint working",
  });
});

export default router;
