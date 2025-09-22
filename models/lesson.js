
// models/Lesson.js
const LessonModel = (sequelize, DataTypes) => {
  const Lesson = sequelize.define("Lesson", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Add more lesson fields as needed
  });

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return Lesson;
};

export default LessonModel;
