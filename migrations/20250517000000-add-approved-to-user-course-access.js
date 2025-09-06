// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("usercourseaccess", "approved", {
//       type: Sequelize.BOOLEAN,
//       defaultValue: false,
//     });
//   },

//   async down(queryInterface) {
//     await queryInterface.removeColumn("usercourseaccess", "approved");
//   },
// };




"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usercourseaccess", "approved", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("usercourseaccess", "approved");
  },
};

