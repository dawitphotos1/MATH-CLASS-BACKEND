// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };



"use strict";

/**
 * 📝 Idempotent Migration Template
 * Use this template to avoid "already exists" / "does not exist" errors
 * when deploying on Render + Neon.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Example 1: Add a column safely
    const userTable = await queryInterface.describeTable("users");
    if (!userTable.is_active) {
      await queryInterface.addColumn("users", "is_active", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
      console.log("✅ Added column is_active to users");
    } else {
      console.log("⚠️ Column is_active already exists, skipping");
    }

    // Example 2: Create a table safely
    const [results] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.courses') as table`
    );

    if (!results[0].table) {
      await queryInterface.createTable("courses", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
      console.log("✅ Created table courses");
    } else {
      console.log("⚠️ Table courses already exists, skipping");
    }
  },

  async down(queryInterface, Sequelize) {
    // Example 1: Remove a column safely
    const userTable = await queryInterface.describeTable("users");
    if (userTable.is_active) {
      await queryInterface.removeColumn("users", "is_active");
      console.log("🗑️ Removed column is_active from users");
    } else {
      console.log("⚠️ Column is_active does not exist, skipping");
    }

    // Example 2: Drop a table safely
    const [results] = await queryInterface.sequelize.query(
      `SELECT to_regclass('public.courses') as table`
    );

    if (results[0].table) {
      await queryInterface.dropTable("courses");
      console.log("🗑️ Dropped table courses");
    } else {
      console.log("⚠️ Table courses does not exist, skipping");
    }
  },
};
