// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// export async function up(queryInterface, Sequelize) {
//   await queryInterface.addColumn('courses', 'category', {
//     type: Sequelize.STRING,
//     allowNull: true,
//     defaultValue: 'General',  // optional — remove if not needed
//   });
// }

// export async function down(queryInterface, Sequelize) {
//   await queryInterface.removeColumn('courses', 'category');
// }



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "category", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "General",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("courses", "category");
  },
};
