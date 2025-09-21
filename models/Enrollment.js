
// import { DataTypes } from "sequelize";

// export default (sequelize) => {
//   const Enrollment = sequelize.define("Enrollment", {
//     status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//   });

//   Enrollment.associate = (models) => {
//     Enrollment.belongsTo(models.User, { foreignKey: "studentId" });
//     Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
//   };

//   return Enrollment;
// };




// models/Enrollment.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Course from "./Course.js";

const Enrollment = sequelize.define("Enrollment", {
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
});

// associations
User.hasMany(Enrollment, { foreignKey: "studentId" });
Enrollment.belongsTo(User, { foreignKey: "studentId", as: "student" });

Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

export default Enrollment;
