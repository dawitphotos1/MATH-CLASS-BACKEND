// module.exports = (sequelize, DataTypes) => {
//   const Teacher = sequelize.define(
//     "Teacher",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(191),
//         allowNull: false,
//         unique: true,
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
//       tableName: "teachers",
//     }
//   );

//   Teacher.associate = (models) => {
//     Teacher.hasMany(models.Course, {
//       foreignKey: "teacherId",
//       as: "courses",
//     });
//   };

//   return Teacher;
// };





import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Teacher = sequelize.define("Teacher", {
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
  });

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: "userId" });
    Teacher.hasMany(models.Course, { foreignKey: "teacherId" });
  };

  return Teacher;
};
