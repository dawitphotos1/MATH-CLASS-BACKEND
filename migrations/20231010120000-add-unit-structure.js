// <<<<<<< HEAD

// // File: Backend/migrations/20231010120000-add-unit-structure.js
// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const tableInfo = await queryInterface.describeTable("Lessons");

//     // Add isUnitHeader only if it doesn't exist
// =======
// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable("Lessons");

// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//     if (!tableInfo.isUnitHeader) {
//       await queryInterface.addColumn("Lessons", "isUnitHeader", {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       });
//     }

// <<<<<<< HEAD
//     // Add unitId only if it doesn't exist
// =======
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//     if (!tableInfo.unitId) {
//       await queryInterface.addColumn("Lessons", "unitId", {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: "Lessons",
//           key: "id",
//         },
//       });
//     }
//   },

// <<<<<<< HEAD
//   down: async (queryInterface, Sequelize) => {
// =======
//   async down(queryInterface, Sequelize) {
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//     await queryInterface.removeColumn("Lessons", "isUnitHeader");
//     await queryInterface.removeColumn("Lessons", "unitId");
//   },
// };



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Lessons");

    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("Lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!tableInfo.unitId) {
      await queryInterface.addColumn("Lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Lessons",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Lessons", "isUnitHeader");
    await queryInterface.removeColumn("Lessons", "unitId");
  },
};
