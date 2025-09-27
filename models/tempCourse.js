
// // models/Course.js
// const CourseModel = (sequelize, DataTypes) => {
//   const Course = sequelize.define("Course", {
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//   });

//   Course.associate = (models) => {
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher", // ✅ link to User, not separate Teacher model
//     });
//     Course.hasMany(models.Lesson, { foreignKey: "courseId", as: "lessons" });
//     Course.hasMany(models.Enrollment, { foreignKey: "courseId", as: "enrollments" });
//     Course.hasMany(models.UserCourseAccess, { foreignKey: "courseId", as: "access" });
//   };

//   return Course;
// };

// export default CourseModel;

// models/Course.js
export default (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: { type: DataTypes.STRING, defaultValue: "Uncategorized" },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.Lesson, { foreignKey: "course_id", as: "lessons" });
    Course.hasMany(models.UserCourseAccess, {
      foreignKey: "course_id",
      as: "enrollments",
    });
    Course.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "teacher",
    });
  };

  return Course;
};
