// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("Lessons", {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       title: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       content: {
//         type: Sequelize.TEXT,
//         allowNull: true,
//       },
//       courseId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: "Courses",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//         onUpdate: "CASCADE",
//       },
// <<<<<<< HEAD
// =======
//       videoUrl: {
//         type: Sequelize.STRING,
//         allowNull: true,
//       },
//       orderIndex: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       isUnitHeader: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//       },
//       unitId: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//         references: {
//           model: "Lessons",
//           key: "id",
//         },
//       },
// >>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable("Lessons");
//   },
// };


"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("lessons", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content_type: {
        type: Sequelize.STRING,
        defaultValue: "text",
      },
      content_url: {
        type: Sequelize.STRING,
      },
      video_url: {
        type: Sequelize.STRING,
      },
      is_preview: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_unit_header: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      unit_id: {
        type: Sequelize.INTEGER,
        references: { model: "lessons", key: "id" },
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("lessons");
  },
};
