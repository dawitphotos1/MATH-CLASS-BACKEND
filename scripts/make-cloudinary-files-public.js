// make-cloudinary-files-public.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dt6otim5b',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function makeFilesPublic() {
  try {
    // List all files in the folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'mathe-class/pdfs',
      max_results: 500
    });
    
    for (const resource of result.resources) {
      // Update each resource to public
      await cloudinary.api.update(resource.public_id, {
        resource_type: 'raw',
        access_mode: 'public'
      });
      console.log(`✅ Made public: ${resource.public_id}`);
    }
    
    console.log('✅ All files are now public');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeFilesPublic();