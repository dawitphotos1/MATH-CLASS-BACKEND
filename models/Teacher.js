
// // models/Teacher.js
// export default (sequelize, DataTypes) => {
//   const Teacher = sequelize.define(
//     "Teacher",
//     {
//       id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//       user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
//     },
//     {
//       tableName: "teachers",
//       underscored: true,
//       timestamps: true,
//     }
//   );

//   Teacher.associate = (models) => {
//     Teacher.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "user",
//     });
//   };

//   return Teacher;
// };





// routes/teacher.js
import express from "express";
import { 
  getTeacherDashboard, 
  getCourseAnalytics 
} from "../controllers/teacherController.js";
import { authenticateToken, isTeacher } from "../middleware/authMiddleware.js";

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(authenticateToken, isTeacher);

// Teacher dashboard
router.get("/dashboard", getTeacherDashboard);
router.get("/courses/:courseId/analytics", getCourseAnalytics);

export default router;