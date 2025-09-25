
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
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "teacher", // ✅ link to User, not separate Teacher model
    });
    Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons" });
    Course.hasMany(models.Enrollment, { foreignKey: "courseId", as: "enrollments" });
    Course.hasMany(models.UserCourseAccess, { foreignKey: "courseId", as: "access" });
  };

  return Course;
};

export default CourseModel;
