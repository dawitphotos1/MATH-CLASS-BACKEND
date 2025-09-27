// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("user_course_access", "approved", {
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
  up: async () => {
    // ⚠️ No-op: 'approved' column already exists in 005-create-user-course-access.cjs
  },
  down: async () => {
    // ⚠️ No-op
  },
};
