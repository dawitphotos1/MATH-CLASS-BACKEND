const fs = require("fs");
const path = require("path");

const logEnrollmentAction = (action, enrollment, user) => {
  const logLine = `[${new Date().toISOString()}] ${action} by ${
    user?.email || "system"
  } on courseId:${enrollment.courseId} for studentId:${enrollment.userId}\n`;
  const logPath = path.join(__dirname, "../logs/enrollment-actions.log");

  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error("❌ Enrollment log error:", err.message);
  });
};

module.exports = logEnrollmentAction;
