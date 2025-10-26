// utils/emails/courseEnrollmentRejected.js
export default ({ studentName, courseTitle }) => {
  return {
    subject: `❌ Enrollment Update: ${courseTitle}`,
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
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
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
            border-left: 4px solid #e74c3c;
          }
          .button {
            display: inline-block;
            background: #3498db;
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
          <h1>Enrollment Update</h1>
          <p>Important information about your course enrollment</p>
        </div>
        
        <div class="content">
          <h2>Hello ${studentName},</h2>
          
          <p>We're writing to inform you about your enrollment request for <strong>${courseTitle}</strong>.</p>
          
          <div class="course-card">
            <h3>${courseTitle}</h3>
            <p><strong>Status:</strong> <span style="color: #e74c3c;">Not Approved</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Unfortunately, your enrollment request has not been approved at this time.</p>
          
          <p>If you believe this is an error or would like more information, please contact our support team.</p>
          
          <p>
            <a href="mailto:support@matheclass.com" class="button">
              Contact Support
            </a>
          </p>
          
          <p>We appreciate your understanding and are here to help if you have any questions.</p>
          
          <div class="footer">
            <p>Best regards,<br>The MathClass Team</p>
            <p>
              <a href="${process.env.FRONTEND_URL}">MathClass Platform</a> | 
              <a href="mailto:support@matheclass.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};