"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Courses", {
      id: {
<<<<<<< HEAD
        allowNull: false,
=======
        papeallowNull: false,
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
<<<<<<< HEAD
=======
      teacherId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
    await queryInterface.dropTable("Courses");
  },
};
