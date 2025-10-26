// // utils/emails/adminNewRegistrationAlert.js
// export default ({ name, email, subject }) => {
//   return {
//     subject: `🆕 New Student Registration: ${name}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>New Student Registered</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
//         <p>A new student has registered on the Math Class platform.</p>
//         <br />
//         <p>Log in to your admin dashboard to review and approve or reject the registration.</p>
//         <a href="${process.env.FRONTEND_URL}/admin" 
//            style="display:inline-block;margin-top:10px;padding:10px 20px;
//            background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
//            Go to Admin Dashboard
//         </a>
//       </div>
//     `,
//   };
// };





// utils/emails/adminNewRegistrationAlert.js
export default ({ name, email, subject }) => {
  return {
    subject: `🆕 New Student Registration: ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Student Registered</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p>A new student has registered on the Math Class platform.</p>
        <br />
        <p>Log in to your admin dashboard to review and approve or reject the registration.</p>
        <a href="${process.env.FRONTEND_URL}/admin" 
           style="display:inline-block;margin-top:10px;padding:10px 20px;
           background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
           Go to Admin Dashboard
        </a>
      </div>
    `,
  };
};
