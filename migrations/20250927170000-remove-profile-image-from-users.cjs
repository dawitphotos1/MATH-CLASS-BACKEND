// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // ✅ Remove profile_image column
//     await queryInterface.removeColumn("users", "profile_image");
//   },

//   async down(queryInterface, Sequelize) {
//     // 🔄 Rollback: add profile_image column back
//     await queryInterface.addColumn("users", "profile_image", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Remove profile_image column
    await queryInterface.removeColumn("users", "profile_image");
  },

  async down(queryInterface, Sequelize) {
    // 🔄 Rollback: add profile_image column back
    await queryInterface.addColumn("users", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
