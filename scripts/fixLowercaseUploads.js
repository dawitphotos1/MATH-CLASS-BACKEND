const { sequelize, Course } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const courses = await Course.findAll();
    for (const course of courses) {
      let updated = false;

      const fixedAttachments = (course.attachmentUrls || []).map((url) => {
        if (url.startsWith("/uploads/")) {
          updated = true;
          return url.replace("/uploads/", "/Uploads/");
        }
        return url;
      });

      if (updated) {
        await course.update({ attachmentUrls: fixedAttachments });
        console.log(`✅ Updated course ID ${course.id}`);
      }
    }

    console.log("✅ All lowercase URLs fixed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
})();
