// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("courses", "material_url", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },
//   async down(queryInterface) {
//     await queryInterface.removeColumn("courses", "material_url");
//   },
// };





"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "material_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("courses", "material_url");
  },
};

