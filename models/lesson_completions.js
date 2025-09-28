
"use strict";
module.exports = (sequelize, DataTypes) => {
  const LessonCompletion = sequelize.define(
    "LessonCompletion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_completions",
      underscored: true,
      timestamps: true, // enables created_at and updated_at
    }
  );

  LessonCompletion.associate = function (models) {
    LessonCompletion.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    LessonCompletion.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      as: "lesson",
    });
  };

  return LessonCompletion;
};
