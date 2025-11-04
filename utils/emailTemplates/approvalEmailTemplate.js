// // utils/emailTemplates/approvalEmailTemplate.js

// export const approvalEmailTemplate = (studentName) => {
//   const logoUrl = "https://math-class-platform.netlify.app/assets/images/mathlogo2.jpg";

//   return `
//   <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
//     <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
//       <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

//       <h2 style="color: #2ecc71;">🎉 Congratulations, ${studentName || "Student"}!</h2>
//       <p style="font-size: 16px; color: #333;">Your MatheClass student account has been <strong>approved</strong> by our admin team.</p>

//       <p style="font-size: 15px; color: #555; line-height: 1.6;">
//         You can now log in to your account and start learning immediately.
//       </p>

//       <a href="https://math-class-platform.netlify.app/login" 
//          style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
//         Go to My Courses
//       </a>

//       <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn’t create this account, please ignore this message.</p>

//       <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
//       <p style="font-size: 13px; color: #888;">
//         © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
//         <a href="https://math-class-platform.netlify.app" style="color: #2ecc71; text-decoration: none;">Visit our website</a>
//       </p>
//     </div>
//   </div>
//   `;
// };





// utils/emailTemplates/approvalEmailTemplate.js

export const approvalEmailTemplate = (studentName) => {
  const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
      <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

      <h2 style="color: #2ecc71;">🎉 Congratulations, ${studentName || "Student"}!</h2>
      <p style="font-size: 16px; color: #333;">Your MatheClass student account has been <strong>approved</strong> by our admin team.</p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        You can now log in to your account and start learning immediately.
      </p>

      <a href="${process.env.FRONTEND_URL}/login" 
         style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Go to My Courses
      </a>

      <p style="margin-top: 30px; font-size: 14px; color: #777;">If you didn’t create this account, please ignore this message.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
        <a href="${process.env.FRONTEND_URL}" style="color: #2ecc71; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
  `;
};
