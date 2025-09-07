
module.exports = (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      courseId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Courses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      accessGrantedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "UserCourseAccess",
      indexes: [
        {
          unique: true,
          fields: ["userId", "courseId"],
        },
      ],
    }
  );

  return UserCourseAccess;
};
