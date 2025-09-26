// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("users", "subject", {
//       type: Sequelize.STRING,
//       allowNull: true,
//       after: "approval_status", // MySQL/MariaDB only (ignored by Postgres)
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("users", "subject");
//   },
// };



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "subject", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "subject");
  },
};
