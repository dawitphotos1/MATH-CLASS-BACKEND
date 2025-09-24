// // models/Course.js
// const CourseModel = (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//     },
//     {
//       tableName: "Courses",
//       freezeTableName: true,
//       timestamps: true,
//     }
//   );

//   Course.associate = (models) => {
//     // Teacher relationship (teachers are User rows with role="teacher")
//     Course.belongsTo(models.User, {
//       as: "teacher",
//       foreignKey: "teacherId",
//     });

//     // Lessons
//     Course.hasMany(models.Lesson, {
//       as: "lessons",
//       foreignKey: "courseId",
//     });

//     // Enrollments (unique alias to avoid collisions)
//     Course.hasMany(models.Enrollment, {
//       as: "courseEnrollments",
//       foreignKey: "courseId",
//     });

//     // UserCourseAccess
//     Course.hasMany(models.UserCourseAccess, {
//       as: "userAccess",
//       foreignKey: "courseId",
//     });
//   };

//   return Course;
// };

// export default CourseModel;




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
      as: "teacher", // ✅ use User, not Teacher (since Teacher is a role)
    });
    Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons" });
    Course.hasMany(models.Enrollment, {
      foreignKey: "courseId",
      as: "enrollments",
    });
    Course.hasMany(models.UserCourseAccess, {
      foreignKey: "courseId",
      as: "access",
    });
  };

  return Course;
};

export default CourseModel;
