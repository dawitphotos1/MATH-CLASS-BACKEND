// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     const tableInfo = await queryInterface.describeTable("Lessons");

//     if (!tableInfo.isUnitHeader) {
//       await queryInterface.addColumn("Lessons", "isUnitHeader", {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       });
//     }

//     if (!tableInfo.unitId) {
//       await queryInterface.addColumn("Lessons", "unitId", {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: "Lessons",
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "SET NULL",
//       });
//     }
//   },

//   async down(queryInterface) {
//     await queryInterface.removeColumn("Lessons", "isUnitHeader");
//     await queryInterface.removeColumn("Lessons", "unitId");
//   },
// };



"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("lessons");

    if (!tableInfo.isUnitHeader) {
      await queryInterface.addColumn("lessons", "isUnitHeader", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!tableInfo.unitId) {
      await queryInterface.addColumn("lessons", "unitId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lessons", // also lowercase here
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("lessons", "isUnitHeader");
    await queryInterface.removeColumn("lessons", "unitId");
  },
};
