// test-cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Test Cloudinary connection
async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // List resources to test connection
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    
    console.log('✅ Cloudinary connection successful!');
    console.log('Account:', cloudinary.config().cloud_name);
    
    // Test a PDF URL generation
    const testPdfUrl = cloudinary.url('sample_pdf', {
      resource_type: 'raw',
      secure: true
    });
    console.log('Test PDF URL:', testPdfUrl);
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.log('Make sure your .env has:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
  }
}

testCloudinary();