// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable("LessonViews", {
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       lessonId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },
//       viewedAt: {
//         type: Sequelize.DATE,
//         allowNull: false,
//         defaultValue: Sequelize.fn("NOW"),
//       },
//     });

//     await queryInterface.addConstraint("LessonViews", {
//       type: "unique",
//       fields: ["userId", "lessonId"],
//       name: "unique_user_lesson_view",
//     });
//   },

//   down: async (queryInterface) => {
//     await queryInterface.dropTable("LessonViews");
//   },
// };





module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("LessonViews", {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lessonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      viewedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("LessonViews", {
      type: "unique",
      fields: ["userId", "lessonId"],
      name: "unique_user_lesson_view",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("LessonViews");
  },
};
  
