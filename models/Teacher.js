
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
