// //migrations/20241105000000-create-units.cjs

// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     // Check if units table already exists
//     const tableExists = await queryInterface.showAllTables();
//     if (tableExists.includes("units")) {
//       console.log("Units table already exists, skipping creation");
//       return;
//     }

//     // Create units table
//     await queryInterface.createTable("units", {
//       id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       course_id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: "courses",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//         onUpdate: "CASCADE",
//       },
//       title: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: Sequelize.TEXT,
//         allowNull: true,
//       },
//       order_index: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       },
//       created_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//       updated_at: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//     });

//     // Check if unit_id column already exists in lessons
//     const lessonTableInfo = await queryInterface.describeTable("lessons");
//     if (!lessonTableInfo.unit_id) {
//       await queryInterface.addColumn("lessons", "unit_id", {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: "units",
//           key: "id",
//         },
//         onDelete: "SET NULL",
//         onUpdate: "CASCADE",
//       });
//     }

//     // Add indexes for better performance
//     await queryInterface.addIndex("units", ["course_id", "order_index"]);
//     await queryInterface.addIndex("lessons", ["unit_id", "order_index"]);

//     console.log("✅ Units migration completed successfully");
//   },

//   down: async (queryInterface, Sequelize) => {
//     // Remove indexes first
//     await queryInterface.removeIndex("lessons", ["unit_id", "order_index"]);
//     await queryInterface.removeIndex("units", ["course_id", "order_index"]);

//     // Remove unit_id from lessons
//     await queryInterface.removeColumn("lessons", "unit_id");

//     // Then drop units table
//     await queryInterface.dropTable("units");
//   },
// };





// migrations/20241105000000-create-units.cjs
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("units")) {
      await queryInterface.createTable("units", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        course_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "courses",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        order_index: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });

      await queryInterface.addIndex("units", ["course_id", "order_index"]);
      console.log("✅ Created units table");
    } else {
      console.log("ℹ️ units table already exists");
    }

    // Ensure lessons table has unit_id
    const lessonTable = await queryInterface.describeTable("lessons");
    if (!lessonTable.unit_id) {
      await queryInterface.addColumn("lessons", "unit_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "units",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addIndex("lessons", ["unit_id", "order_index"]);
      console.log("✅ Added unit_id to lessons");
    } else {
      console.log("ℹ️ lessons.unit_id already exists");
    }
  },

  down: async (queryInterface) => {
    // Remove index, column, then table
    try {
      await queryInterface.removeIndex("lessons", ["unit_id", "order_index"]);
    } catch (e) {}
    try {
      await queryInterface.removeIndex("units", ["course_id", "order_index"]);
    } catch (e) {}
    try {
      await queryInterface.removeColumn("lessons", "unit_id");
    } catch (e) {}
    try {
      await queryInterface.dropTable("units");
    } catch (e) {}
  },
};
