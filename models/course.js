
// "use strict";

// module.exports = (sequelize, DataTypes) => {
//   const Course = sequelize.define(
//     "Course",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       title: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       teacherId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "users", // ✅ Updated from "Teachers" to "users"
//           key: "id",
//         },
//         onDelete: "SET NULL",
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "courses",
//     }
//   );

//   Course.associate = (models) => {
//     // ✅ Associate with User as the teacher
//     Course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//     });

//     Course.hasMany(models.Lesson, {
//       foreignKey: "courseId",
//       as: "lessons",
//     });

//     Course.belongsToMany(models.User, {
//       through: models.UserCourseAccess,
//       foreignKey: "course_id",
//       as: "enrolledUsers",
//     });

//     // ✅ Optional: one-to-many with enrollments if you use the Enrollment model
//     Course.hasMany(models.Enrollment, {
//       foreignKey: "courseId",
//       as: "enrollments",
//     });
//   };

//   return Course;
// };





import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Course = sequelize.define("Course", {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { as: "teacher", foreignKey: "teacherId" });
    Course.hasMany(models.Lesson, { foreignKey: "courseId" });
    Course.belongsToMany(models.User, {
      through: models.Enrollment,
      foreignKey: "courseId",
    });
  };

  return Course;
};
