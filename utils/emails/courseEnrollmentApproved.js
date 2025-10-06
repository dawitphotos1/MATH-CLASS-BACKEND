// module.exports = (user, course) => {
//   return {
//     subject: `Enrollment Approved: ${course.title}`,
//     text: `Hi ${user.name},\n\nYour enrollment in the course "${course.title}" has been approved!\n\nHappy learning!`,
//     html: `<p>Hi ${user.name},</p><p>Your enrollment in <strong>${course.title}</strong> has been approved!</p><p>Happy learning!</p>`,
//   };
// };



module.exports = (user, course) => {
  return {
    subject: `🎉 Enrollment Confirmed: ${course.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            padding: 30px; 
            background: #f9f9f9; 
            border-radius: 0 0 10px 10px;
          }
          .course-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Enrollment Confirmed!</h1>
          <p>You're officially enrolled in your MathClass course</p>
        </div>
        
        <div class="content">
          <h2>Hello ${user.name},</h2>
          
          <p>Great news! Your enrollment in <strong>${
            course.title
          }</strong> has been confirmed and your payment was processed successfully.</p>
          
          <div class="course-card">
            <h3>${course.title}</h3>
            <p>${
              course.description || "Learn mathematics with expert guidance"
            }</p>
            <p><strong>Enrollment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Amount Paid:</strong> $${parseFloat(
              course.price
            ).toFixed(2)}</p>
          </div>
          
          <p>You now have full access to all course materials, including:</p>
          <ul>
            <li>📚 All lessons and units</li>
            <li>🎥 Video lectures</li>
            <li>📝 Practice exercises</li>
            <li>📊 Progress tracking</li>
          </ul>
          
          <p>
            <a href="${process.env.FRONTEND_URL}/my-courses" class="button">
              Start Learning Now
            </a>
          </p>
          
          <p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
          
          <div class="footer">
            <p>Happy Learning!<br>The MathClass Team</p>
            <p>
              <a href="${process.env.FRONTEND_URL}">MathClass Platform</a> | 
              <a href="${process.env.FRONTEND_URL}/contact">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};