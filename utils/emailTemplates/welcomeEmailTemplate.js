// // utils/emailTemplates/welcomeEmailTemplate.js

// export const welcomeEmailTemplate = (studentName) => {
//   const logoUrl = "https://math-class-platform.netlify.app/assets/images/mathlogo2.jpg";

//   return `
//   <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
//     <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
//       <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

//       <h2 style="color: #3498db;">👋 Welcome to MatheClass, ${studentName || "Student"}!</h2>
//       <p style="font-size: 16px; color: #333;">We’re thrilled to have you join our learning community.</p>

//       <p style="font-size: 15px; color: #555; line-height: 1.6;">
//         You can now browse your courses, access materials, and start mastering mathematics with confidence.
//       </p>

//       <a href="https://math-class-platform.netlify.app/my-courses" 
//          style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
//         View My Courses
//       </a>

//       <p style="margin-top: 20px; font-size: 14px; color: #555;">
//         Need help? Contact us at 
//         <a href="mailto:support@matheclass.com" style="color: #3498db;">support@matheclass.com</a>.
//       </p>

//       <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
//       <p style="font-size: 13px; color: #888;">
//         © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
//         <a href="https://math-class-platform.netlify.app" style="color: #3498db; text-decoration: none;">Visit our website</a>
//       </p>
//     </div>
//   </div>
//   `;
// };



// utils/emailTemplates/welcomeEmailTemplate.js

export const welcomeEmailTemplate = (studentName) => {
  const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 30px; text-align: center;">
      <img src="${logoUrl}" alt="MatheClass Logo" style="max-width: 120px; margin-bottom: 20px;" />

      <h2 style="color: #3498db;">👋 Welcome to MatheClass, ${studentName || "Student"}!</h2>
      <p style="font-size: 16px; color: #333;">We’re thrilled to have you join our learning community.</p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        You can now browse your courses, access materials, and start mastering mathematics with confidence.
      </p>

      <a href="${process.env.FRONTEND_URL}/my-courses" 
         style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3498db; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View My Courses
      </a>

      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        Need help? Contact us at 
        <a href="mailto:support@matheclass.com" style="color: #3498db;">support@matheclass.com</a>.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} MatheClass. All rights reserved.<br/>
        <a href="${process.env.FRONTEND_URL}" style="color: #3498db; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
  `;
};
