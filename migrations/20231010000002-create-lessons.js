"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Lessons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
<<<<<<< HEAD
=======
      videoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isUnitHeader: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      unitId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Lessons",
          key: "id",
        },
      },
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Lessons");
  },
};
