
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Enrollment = sequelize.define("Enrollment", {
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: "studentId" });
    Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return Enrollment;
};
