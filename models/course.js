

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
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Course = sequelize.define("Course", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

export default Course;
