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
    // Teacher relationship (teachers are users with role="teacher")
    Course.belongsTo(models.User, {
      as: "teacher",
      foreignKey: "teacherId",
    });

    // Lessons
    Course.hasMany(models.Lesson, {
      as: "lessons",
      foreignKey: "courseId",
    });

    // Enrollments
    Course.hasMany(models.Enrollment, {
      as: "courseEnrollments", // ✅ only defined here
      foreignKey: "courseId",
    });

    // UserCourseAccess
    Course.hasMany(models.UserCourseAccess, {
      as: "userAccess",
      foreignKey: "courseId",
    });
  };

  return Course;
};

export default CourseModel;
