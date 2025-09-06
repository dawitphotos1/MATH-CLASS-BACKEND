// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn("courses", "price");
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("courses", "price", {
//       type: Sequelize.FLOAT,
//       allowNull: true, // Set based on your original schema (change if needed)
//     });
//   },
// };



"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("courses", "price");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("courses", "price", {
      type: Sequelize.FLOAT,
      allowNull: true, // Set based on your original schema (change if needed)
    });
  },
};
