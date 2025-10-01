// module.exports = (sequelize, DataTypes) => {
//   const LessonView = sequelize.define(
//     "LessonView",
//     {
//       userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       lessonId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       viewedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       timestamps: false,
//       indexes: [
//         {
//           unique: true,
//           fields: ["userId", "lessonId"],
//         },
//       ],
//     }
//   );

//   LessonView.associate = (models) => {
//     LessonView.belongsTo(models.Lesson, {
//       foreignKey: "lessonId",
//       onDelete: "CASCADE",
//     });

//     LessonView.belongsTo(models.User, {
//       foreignKey: "userId",
//       onDelete: "CASCADE",
//     });
//   };

//   return LessonView;
// };




// models/LessonView.js
export default (sequelize, DataTypes) => {
  const LessonView = sequelize.define(
    "LessonView",
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      lesson_id: { type: DataTypes.INTEGER, allowNull: false },
      viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lesson_views",
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "lesson_id"],
        },
      ],
    }
  );

  LessonView.associate = (models) => {
    LessonView.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    LessonView.belongsTo(models.Lesson, {
      foreignKey: "lesson_id",
      onDelete: "CASCADE",
    });
  };

  return LessonView;
};
