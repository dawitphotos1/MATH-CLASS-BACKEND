// // models/lesson.js
// module.exports = (sequelize, DataTypes) => {
//   const Lesson = sequelize.define(
//     "Lesson",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       course_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "courses",
//           key: "id",
//         },
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       content: DataTypes.TEXT,
//       video_url: DataTypes.STRING,
//       order_index: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "lessons", // Explicitly set the table name to match DB table
//       freezeTableName: true,
//       underscored: true, // Maps camelCase JS props to snake_case DB columns
//       timestamps: true, // Enable Sequelize's auto timestamps (createdAt/updatedAt)
//       createdAt: "created_at",
//       updatedAt: "updated_at",
//     }
//   );

//   // Optional associations can be defined here
//   Lesson.associate = function (models) {
//     Lesson.belongsTo(models.Course, { foreignKey: "course_id" });
//   };

//   return Lesson;
// };




import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Lesson = sequelize.define("Lesson", {
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
  });

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return Lesson;
};
