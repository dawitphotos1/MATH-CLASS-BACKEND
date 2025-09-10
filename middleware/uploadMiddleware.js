const multer = require("multer");

// ✅ Use memory storage (we save file manually in controller)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max size
});

module.exports = upload;
