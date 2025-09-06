// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("courses", "slug", {
//       type: Sequelize.STRING(255),
//       allowNull: false,
//       unique: true,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("courses", "slug");
//   },
// };

// Inside migrations/20250815175039-add-slug-to-courses.js

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
