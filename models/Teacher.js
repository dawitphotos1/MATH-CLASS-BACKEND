// models/Teacher.js
const TeacherModel = (sequelize, DataTypes) => {
  const Teacher = sequelize.define("Teacher", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Add any other fields specific to teachers here
  });

  Teacher.associate = (models) => {
    Teacher.hasMany(models.Course, { foreignKey: "teacherId" });
  };

  return Teacher;
};

export default TeacherModel;
