// // models/lessonProgress.js

// const { Model, DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   class LessonProgress extends Model {}

//   LessonProgress.init(
//     {
//       userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//       },
//       lessonId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//       },
//       progress: {
//         type: DataTypes.FLOAT, // e.g., percentage complete
//         defaultValue: 0,
//       },
//       lastViewedAt: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       sequelize,
//       modelName: "LessonProgress",
//       tableName: "LessonProgresses",
//       timestamps: false,
//     }
//   );

//   return LessonProgress;
// };




// models/LessonProgress.js
export default (sequelize, DataTypes) => {
  const LessonProgress = sequelize.define(
    "LessonProgress",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      progress: {
        type: DataTypes.FLOAT, // percentage complete
        defaultValue: 0,
      },
      last_viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_progresses",
      underscored: true,
      timestamps: false,
    }
  );

  LessonProgress.associate = (models) => {
    LessonProgress.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    LessonProgress.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
  };

  return LessonProgress;
};
