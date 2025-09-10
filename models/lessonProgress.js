// models/lessonProgress.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LessonProgress extends Model {}

  LessonProgress.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      lessonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      progress: {
        type: DataTypes.FLOAT, // e.g., percentage complete
        defaultValue: 0,
      },
      lastViewedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "LessonProgress",
      tableName: "LessonProgresses",
      timestamps: false,
    }
  );

  return LessonProgress;
};
