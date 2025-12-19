

// migrations/009-update-attachments-for-sublessons.cjs
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add sublesson_id column
    await queryInterface.addColumn("attachments", "sublesson_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "sublessons",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add file_name and file_size columns
    await queryInterface.addColumn("attachments", "file_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("attachments", "file_size", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Make lesson_id nullable (since attachments can now belong to sublessons)
    await queryInterface.changeColumn("attachments", "lesson_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "lessons",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add constraint: attachment must belong to either lesson OR sublesson
    await queryInterface.addConstraint("attachments", {
      fields: ["lesson_id", "sublesson_id"],
      type: "check",
      where: {
        [Sequelize.Op.or]: [
          { lesson_id: { [Sequelize.Op.ne]: null } },
          { sublesson_id: { [Sequelize.Op.ne]: null } },
        ],
      },
      name: "attachments_belongs_to_check",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove constraint
    await queryInterface.removeConstraint(
      "attachments",
      "attachments_belongs_to_check"
    );

    // Remove columns
    await queryInterface.removeColumn("attachments", "sublesson_id");
    await queryInterface.removeColumn("attachments", "file_name");
    await queryInterface.removeColumn("attachments", "file_size");

    // Restore lesson_id to not null
    await queryInterface.changeColumn("attachments", "lesson_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "lessons",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },
};