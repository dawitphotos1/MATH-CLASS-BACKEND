// // utils/uploadHelper.js
// import fs from "fs";
// import path from "path";

// export const uploadToStorage = async (file) => {
//   const uploadPath = path.join("uploads", Date.now() + "-" + file.originalname);

//   fs.writeFileSync(uploadPath, file.buffer);

//   return `/${uploadPath}`;
// };




// utils/uploadHelper.js
import fs from "fs";
import path from "path";

export const uploadToStorage = async (file) => {
  const uploadPath = path.join("uploads", Date.now() + "-" + file.originalname);

  fs.writeFileSync(uploadPath, file.buffer);

  return `/${uploadPath}`;
};
