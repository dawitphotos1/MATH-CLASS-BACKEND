// scripts/test-email.js - Backend test script
import dotenv from "dotenv";
dotenv.config();

import sendEmail from "../utils/sendEmail.js";

async function testEmail() {
  console.log("🧪 EMAIL CONFIGURATION TEST");
  console.log("=".repeat(50));
  
  // Check environment variables
  console.log("\n📋 ENVIRONMENT CHECK:");
  console.log(`   MAIL_HOST: ${process.env.MAIL_HOST || 'Not set'}`);
  console.log(`   MAIL_PORT: ${process.env.MAIL_PORT || 'Not set'}`);
  console.log(`   MAIL_USER: ${process.env.MAIL_USER ? '***' + process.env.MAIL_USER.slice(-8) : 'Not set'}`);
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`);
  console.log(`   EMAIL_ENABLED: ${process.env.EMAIL_ENABLED || 'true'}`);
  
  if (!process.env.ADMIN_EMAIL) {
    console.error("\n❌ ERROR: ADMIN_EMAIL is not set in environment variables");
    process.exit(1);
  }
  
  console.log("\n🚀 ATTEMPTING TO SEND TEST EMAIL...");
  console.log(`   To: ${process.env.ADMIN_EMAIL}`);
  
  try {
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🧪 Email Test from Math Class Platform",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60; text-align: center;">✅ Email Test Successful</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Backend:</strong> ${process.env.BACKEND_URL || 'Local'}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          </div>
          <p style="text-align: center; color: #6c757d;">
            If you're reading this, your email configuration is working correctly! 🎉
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated test from Math Class Platform backend
          </p>
        </div>
      `,
    });
    
    console.log("\n📧 TEST RESULT:");
    console.log("=".repeat(50));
    
    if (result.success) {
      console.log("✅ SUCCESS: Email sent successfully!");
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response || 'N/A'}`);
    } else {
      console.log("⚠️ PARTIAL SUCCESS: Email attempted but may have failed");
      console.log(`   Error: ${result.error || 'Unknown error'}`);
      console.log(`   Note: ${result.note || 'No additional info'}`);
    }
    
    console.log("\n🔍 ADDITIONAL INFO:");
    console.log(`   Client Success: ${result.clientSuccess || 'N/A'}`);
    console.log(`   App Status: Running normally`);
    
  } catch (error) {
    console.error("\n❌ UNEXPECTED ERROR:");
    console.error(`   ${error.message}`);
    console.error(`   Stack: ${error.stack?.split('\n')[1] || 'N/A'}`);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("🧪 Test completed. Check your email inbox (and spam folder).");
}

// Run the test
testEmail();