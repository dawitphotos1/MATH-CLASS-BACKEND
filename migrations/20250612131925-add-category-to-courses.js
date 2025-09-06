// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("courses", "category", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },
//   async down(queryInterface) {
//     await queryInterface.removeColumn("courses", "category");
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("courses", "category");
  },
};

