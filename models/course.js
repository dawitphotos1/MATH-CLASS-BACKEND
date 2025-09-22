

// import { DataTypes } from "sequelize";

// export default (sequelize) => {
//   const Course = sequelize.define("Course", {
//     title: { type: DataTypes.STRING, allowNull: false },
//     description: { type: DataTypes.TEXT, allowNull: true },
//     price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
//   });

//   Course.associate = (models) => {
//     Course.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
//     Course.hasMany(models.Lesson, { foreignKey: "courseId" });
//     Course.belongsToMany(models.User, {
//       through: models.Enrollment,
//       foreignKey: "courseId",
//     });
//   };

//   return Course;
// };



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
