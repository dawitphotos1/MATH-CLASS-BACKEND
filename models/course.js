
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const course = sequelize.define(
//     "course",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );

//   course.associate = (models) => {
//     course.belongsToMany(models.User, {
//       through: models.UserCourseAccess,
//       foreignKey: "courseId",
//       otherKey: "userId",
//     });

//     course.belongsTo(models.User, {
//       foreignKey: "teacherId",
//       as: "teacher",
//     });

//     course.hasMany(models.Lesson, {
//       foreignKey: "courseId",
//       as: "lessons",
//       onDelete: "CASCADE",
//     });
//   };

//   return course;
// };



module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Teachers",
          key: "id",
        },
        onDelete: "SET NULL",
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
      tableName: "Courses",
    }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.Teacher, {
      foreignKey: "teacherId",
      as: "teacher",
    });

    Course.hasMany(models.Lesson, {
      foreignKey: "courseId",
      as: "lessons",
    });

    Course.belongsToMany(models.User, {
      through: models.UserCourseAccess,
      foreignKey: "courseId",
      as: "enrolledUsers",
    });
  };

  return Course;
};
