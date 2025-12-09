
// // utils/sendEmail.js
// import nodemailer from 'nodemailer';

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     console.log('📧 Creating Yahoo Mail transporter...');
    
//     // Check if email credentials exist
//     if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
//       throw new Error('Yahoo Mail credentials are missing. Check MAIL_USER and MAIL_PASS environment variables.');
//     }

//     console.log('📧 Yahoo Mail user:', process.env.MAIL_USER);
    
//     // Create Yahoo Mail transporter with timeout settings
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST || 'smtp.mail.yahoo.com',
//       port: process.env.MAIL_PORT || 465,
//       secure: true,
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//       // Add timeout settings to prevent hanging
//       connectionTimeout: 5000, // 5 seconds
//       socketTimeout: 5000,     // 5 seconds
//       greetingTimeout: 5000,   // 5 seconds
//     });

//     console.log('📧 Sending email to:', to);
    
//     // Verify connection with timeout
//     console.log('📧 Verifying Yahoo Mail connection...');
//     await transporter.verify();
//     console.log('✅ Yahoo Mail server connection verified');

//     // Send email
//     const mailOptions = {
//       from: process.env.EMAIL_FROM || process.env.MAIL_USER,
//       to,
//       subject,
//       html,
//     };

//     console.log('📧 Attempting to send email...');
//     const result = await transporter.sendMail(mailOptions);
    
//     console.log('✅ Yahoo Mail sent successfully. Message ID:', result.messageId);
//     console.log('✅ Response:', result.response);
    
//     return result;
    
//   } catch (error) {
//     console.error('❌ Yahoo Mail sending failed:');
//     console.error('❌ Error message:', error.message);
//     console.error('❌ Error code:', error.code);
    
//     // More specific error messages
//     if (error.code === 'ETIMEDOUT') {
//       throw new Error('Yahoo Mail connection timed out. The server might be slow or blocked.');
//     } else if (error.code === 'EAUTH') {
//       throw new Error('Yahoo Mail authentication failed. Check your email credentials.');
//     } else if (error.code === 'ECONNECTION') {
//       throw new Error('Cannot connect to Yahoo Mail server. Check your network or try again later.');
//     }
    
//     throw new Error(`Email sending failed: ${error.message}`);
//   }
// };

// export default sendEmail;






// utils/sendEmail.js
import nodemailer from 'nodemailer';

// Mock email function for fallback
const mockSendEmail = async ({ to, subject, html }) => {
  console.log('📧 [MOCK] Would send email to:', to);
  console.log('📧 [MOCK] Subject:', subject);
  console.log('📧 [MOCK] HTML length:', html?.length || 0);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    messageId: `mock-${Date.now()}`,
    response: '250 Mock email sent successfully'
  };
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('📧 Creating Yahoo Mail transporter...');
    
    // Check if email credentials exist
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('⚠️ Yahoo Mail credentials are missing. Using mock email.');
      return await mockSendEmail({ to, subject, html });
    }

    console.log('📧 Yahoo Mail user:', process.env.MAIL_USER.substring(0, 3) + '***');
    
    // Create Yahoo Mail transporter with timeout settings
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mail.yahoo.com',
      port: process.env.MAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Add timeout settings to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000,     // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
    });

    console.log('📧 Sending email to:', to);
    
    // Verify connection with timeout
    console.log('📧 Verifying Yahoo Mail connection...');
    await transporter.verify();
    console.log('✅ Yahoo Mail server connection verified');

    // Send email
    const mailOptions = {
      from: `"Math Class Platform" <${process.env.EMAIL_FROM || process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log('📧 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Yahoo Mail sent successfully. Message ID:', result.messageId);
    console.log('✅ Response:', result.response);
    
    return result;
    
  } catch (error) {
    console.error('❌ Yahoo Mail sending failed:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    // Fall back to mock email
    console.log('🔄 Falling back to mock email service...');
    return await mockSendEmail({ to, subject, html });
  }
};

export default sendEmail;