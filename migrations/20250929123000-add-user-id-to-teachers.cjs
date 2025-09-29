// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("teachers", "user_id", {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//       unique: true,
//       references: { model: "users", key: "id" },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn("teachers", "user_id");
//   },
// };





"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("teachers", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("teachers", "user_id");
  },
};
