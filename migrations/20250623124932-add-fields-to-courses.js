// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("courses", "duration", {
//       type: Sequelize.INTEGER,
//       allowNull: true,
//     });
//     await queryInterface.addColumn("courses", "level", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },
//   async down(queryInterface) {
//     await queryInterface.removeColumn("courses", "duration");
//     await queryInterface.removeColumn("courses", "level");
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "duration", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("courses", "level", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("courses", "duration");
    await queryInterface.removeColumn("courses", "level");
  },
};

