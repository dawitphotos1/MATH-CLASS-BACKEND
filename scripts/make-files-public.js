// make-files-public.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dt6otim5b',
  api_key: 'YOUR_API_KEY',  // Get from Cloudinary dashboard
  api_secret: 'YOUR_API_SECRET'  // Get from Cloudinary dashboard
});

async function makeAllFilesPublic() {
  try {
    // Get all resources in the folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'mathe-class/pdfs',
      max_results: 100
    });
    
    console.log(`Found ${result.resources.length} files`);
    
    // Make each file public
    for (const resource of result.resources) {
      try {
        await cloudinary.api.update(resource.public_id, {
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public'
        });
        console.log(`✅ Made public: ${resource.public_id}`);
      } catch (error) {
        console.log(`⚠️  Could not update ${resource.public_id}: ${error.message}`);
      }
    }
    
    console.log('✅ All files should now be public');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeAllFilesPublic();