
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("attachments", [
      {
        lesson_id: 1, // assumes lesson with ID=1 exists
        file_path: "uploads/lesson1/notes.pdf",
        file_type: "pdf",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lesson_id: 1,
        file_path: "uploads/lesson1/example.mp4",
        file_type: "video",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        lesson_id: 2, // another lesson
        file_path: "uploads/lesson2/worksheet.docx",
        file_type: "docx",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("attachments", null, {});
  },
};
