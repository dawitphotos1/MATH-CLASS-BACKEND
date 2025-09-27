module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("lesson_views", {
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

    await queryInterface.addConstraint("lesson_views", {
      type: "unique",
      fields: ["userId", "lessonId"],
      name: "unique_user_lesson_view",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("lesson_views");
  },
};
  
