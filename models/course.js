
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  Course.associate = (models) => {
    Course.belongsToMany(models.User, {
      through: models.UserCourseAccess,
      foreignKey: "courseId",
      otherKey: "userId",
    });

    Course.belongsTo(models.User, {
      foreignKey: "teacherId",
      as: "teacher",
    });

    Course.hasMany(models.Lesson, {
      foreignKey: "courseId",
      as: "lessons",
      onDelete: "CASCADE",
    });
  };

  return Course;
};
