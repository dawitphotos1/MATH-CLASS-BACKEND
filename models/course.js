
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
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        field: "teacher_id",
      },
    },
    {
      tableName: "courses",
      timestamps: true,
      underscored: true,
    }
  );

  Course.associate = (models) => {
    Course.belongsToMany(models.User, {
      through: models.UserCourseAccess,
      foreignKey: { name: "courseId", field: "course_id" },
      otherKey: { name: "userId", field: "user_id" },
    });

    Course.belongsTo(models.User, {
      foreignKey: { name: "teacherId", field: "teacher_id" },
      as: "teacher",
    });

    Course.hasMany(models.Lesson, {
      foreignKey: { name: "courseId", field: "course_id" },
      as: "lessons",
      onDelete: "CASCADE",
    });
  };

  return Course;
};
