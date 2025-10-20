
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("lessons", "file_url", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("lessons", "file_url");
//   },
// };






"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("lessons", "file_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("lessons", "file_url");
  },
};
