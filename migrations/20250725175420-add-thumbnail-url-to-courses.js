
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND column_name = 'thumbnailUrl';
    `);

    if (results.length === 0) {
      await queryInterface.addColumn("courses", "thumbnailUrl", {
        type: Sequelize.STRING,
        allowNull: true,
      });
      console.log("✅ 'thumbnailUrl' column added to 'courses' table.");
    } else {
      console.log(
        "ℹ️ 'thumbnailUrl' column already exists in 'courses'. Skipping."
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND column_name = 'thumbnailUrl';
    `);

    if (results.length > 0) {
      await queryInterface.removeColumn("courses", "thumbnailUrl");
      console.log("✅ 'thumbnailUrl' column removed from 'courses' table.");
    } else {
      console.log(
        "ℹ️ 'thumbnailUrl' column does not exist in 'courses'. Skipping removal."
      );
    }
  },
};
