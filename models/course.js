
// models/Course.js
const CourseModel = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Add more course fields as needed
  });

  Course.associate = (models) => {
    Course.belongsTo(models.Teacher, { foreignKey: "teacherId" });
    Course.hasMany(models.Lesson, { foreignKey: "courseId" });
    Course.hasMany(models.Enrollment, { foreignKey: "courseId" });
    Course.hasMany(models.UserCourseAccess, { foreignKey: "courseId" });
  };

  return Course;
};

export default CourseModel;
