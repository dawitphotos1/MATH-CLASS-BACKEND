
// models/LessonProgress.js
export default (sequelize, DataTypes) => {
  const LessonProgress = sequelize.define(
    "LessonProgress",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "lesson_id",
      },
      progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      last_viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "last_viewed_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_progresses",
      underscored: true,
      timestamps: false,
    }
  );

  LessonProgress.associate = (models) => {
    LessonProgress.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    LessonProgress.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
  };

  return LessonProgress;
};
