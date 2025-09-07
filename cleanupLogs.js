// cleanupLogs.js
const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "logs", "enrollments.log");
const archivePath = path.join(__dirname, "logs", `archive-${Date.now()}.log`);

try {
  if (fs.existsSync(logPath)) {
    const stats = fs.statSync(logPath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB >= 1) {
      fs.renameSync(logPath, archivePath); // move to archive
      fs.writeFileSync(logPath, ""); // reset log file
      console.log(`🗂️ Archived to: ${archivePath}`);
    } else {
      console.log(
        `✅ Log file OK (${sizeMB.toFixed(2)} MB), no cleanup needed.`
      );
    }
  } else {
    console.warn("⚠️ Log file does not exist.");
  }
} catch (err) {
  console.error("❌ Error during log cleanup:", err.message);
}
