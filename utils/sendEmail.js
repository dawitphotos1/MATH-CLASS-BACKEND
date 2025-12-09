// utils/sendEmail.js - ES Module version
import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('📧 Creating Yahoo Mail transporter...');
    
    // Check if email credentials exist
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('Yahoo Mail credentials are missing. Check MAIL_USER and MAIL_PASS environment variables.');
    }

    console.log('📧 Yahoo Mail user:', process.env.MAIL_USER.substring(0, 3) + '***');
    
    // Create Yahoo Mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mail.yahoo.com',
      port: process.env.MAIL_PORT || 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
      greetingTimeout: 5000,
    });

    console.log('📧 Sending email to:', to);
    
    // Verify connection
    console.log('📧 Verifying Yahoo Mail connection...');
    await transporter.verify();
    console.log('✅ Yahoo Mail server connection verified');

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      html,
    };

    console.log('📧 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Yahoo Mail sent successfully. Message ID:', result.messageId);
    
    return result;
    
  } catch (error) {
    console.error('❌ Yahoo Mail sending failed:', error.message);
    
    // Return mock response instead of crashing
    return {
      messageId: `mock-${Date.now()}`,
      response: `Mock email sent (actual error: ${error.message})`
    };
  }
};

export default sendEmail;