
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
