


// models/Lesson.js
export default (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      content_type: {
        type: DataTypes.ENUM("text", "video", "file"),
        allowNull: false,
      },
      content: { type: DataTypes.TEXT, allowNull: true },
      file_url: { type: DataTypes.STRING, allowNull: true },
      video_url: { type: DataTypes.STRING, allowNull: true },
      course_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "lessons",
      underscored: true,
      timestamps: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, { foreignKey: "course_id", as: "course" });
  };

  return Lesson;
};
