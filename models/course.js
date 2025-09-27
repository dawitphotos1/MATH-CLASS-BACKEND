
// models/Course.js
export default (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: { type: DataTypes.STRING, defaultValue: "Uncategorized" },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "courses",
      underscored: true,
      timestamps: true,
    }
  );

  Course.associate = (models) => {
    Course.hasMany(models.Lesson, { foreignKey: "course_id", as: "lessons" });
    Course.hasMany(models.UserCourseAccess, {
      foreignKey: "course_id",
      as: "enrollments",
    });
    Course.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "teacher",
    });
  };

  return Course;
};
