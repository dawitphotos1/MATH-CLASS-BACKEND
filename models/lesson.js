
// // models/Lesson.js
// export default (sequelize, DataTypes) => {
//   const Lesson = sequelize.define(
//     "Lesson",
//     {
//       course_id: { type: DataTypes.INTEGER, allowNull: false },
//       title: { type: DataTypes.STRING, allowNull: false },
//       content: { type: DataTypes.TEXT },
//       video_url: { type: DataTypes.STRING },
//       order_index: { type: DataTypes.INTEGER, allowNull: false },
//     },
//     {
//       tableName: "lessons",
//       underscored: true,
//     }
//   );

//   Lesson.associate = (models) => {
//     Lesson.belongsTo(models.Course, {
//       foreignKey: "course_id",
//       onDelete: "CASCADE",
//     });

//     Lesson.hasMany(models.Attachment, {
//       foreignKey: "lesson_id",
//       onDelete: "CASCADE",
//       hooks: true,
//     });

//     Lesson.hasMany(models.LessonCompletion, {
//       foreignKey: "lesson_id",
//       as: "completions",
//       onDelete: "CASCADE",
//       hooks: true,
//     });
//   };

//   return Lesson;
// };





export default (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT },
      video_url: { type: DataTypes.STRING },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "lessons",
      underscored: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course", // ✅ alias
      onDelete: "CASCADE",
    });

    Lesson.hasMany(models.Attachment, {
      foreignKey: "lesson_id",
      as: "attachments", // ✅ alias
      onDelete: "CASCADE",
      hooks: true,
    });

    Lesson.hasMany(models.LessonCompletion, {
      foreignKey: "lesson_id",
      as: "completions",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Lesson;
};
