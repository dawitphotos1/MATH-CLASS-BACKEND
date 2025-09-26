
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('courses');
    if (table.slug) {
      await queryInterface.removeColumn('courses', 'slug');
    }
  }
};
