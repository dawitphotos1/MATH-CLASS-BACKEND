
// models/LessonView.js
export default (sequelize, DataTypes) => {
  const LessonView = sequelize.define(
    "LessonView",
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
      viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "viewed_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_views",
      underscored: true,
      timestamps: false,
    }
  );

  LessonView.associate = (models) => {
    LessonView.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    LessonView.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
  };

  return LessonView;
};
