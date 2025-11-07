// models/Lesson.js

export default (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      video_url: { type: DataTypes.STRING, allowNull: true },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      content_type: {
        type: DataTypes.ENUM("text", "video", "mixed"),
        defaultValue: "text",
      },
    },
    {
      tableName: "lessons",
      timestamps: true,
      underscored: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Unit, { foreignKey: "unit_id", as: "unit" });
    Lesson.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
    Lesson.hasMany(models.LessonCompletion, {
      foreignKey: "lesson_id",
      as: "completions",
    });
  };

  return Lesson;
};
