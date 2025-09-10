// models/lessoncompletion.js

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LessonCompletion extends Model {}

  LessonCompletion.init(
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
      completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "LessonCompletion",
      tableName: "LessonCompletions",
      timestamps: false,
    }
  );

  return LessonCompletion;
};
