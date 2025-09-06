
// module.exports = (sequelize, DataTypes) => {
//   const lesson = sequelize.define(
//     "lesson",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       contentType: {
//         type: DataTypes.STRING,
//         defaultValue: "text",
//       },
//       contentUrl: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       isPreview: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//       },
//       isUnitHeader: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//       },
//       orderIndex: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         defaultValue: 0,
//       },
//       courseId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       unitId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "lessons",
//           key: "id",
//         },
//       },
//       createdAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//       updatedAt: {
//         type: DataTypes.DATE,
//         allowNull: false,
//       },
//     },
//     {
//       tableName: "lessons",
//       indexes: [{ fields: ["isUnitHeader"] }, { fields: ["unitId"] }],
//     }
//   );

//   lesson.associate = (models) => {
//     if (!models.Course) {
//       console.error("Course model is undefined in lessons.associate");
//       return;
//     }

//     lesson.belongsTo(models.Course, {
//       foreignKey: "courseId",
//       as: "course",
//     });

//     lesson.belongsTo(models.lesson, {
//       foreignKey: "unitId",
//       as: "unit",
//     });
//   };

//   return lesson;
// };



module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING,
        field: "content_type",
        defaultValue: "text",
      },
      contentUrl: {
        type: DataTypes.STRING,
        field: "content_url",
      },
      videoUrl: {
        type: DataTypes.STRING,
        field: "video_url",
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        field: "is_preview",
        defaultValue: false,
      },
      isUnitHeader: {
        type: DataTypes.BOOLEAN,
        field: "is_unit_header",
        defaultValue: false,
      },
      orderIndex: {
        type: DataTypes.INTEGER,
        field: "order_index",
        allowNull: false,
        defaultValue: 0,
      },
      courseId: {
        type: DataTypes.INTEGER,
        field: "course_id",
        allowNull: false,
      },
      unitId: {
        type: DataTypes.INTEGER,
        field: "unit_id",
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        allowNull: true,
      },
    },
    {
      tableName: "lessons",
      timestamps: true,
      underscored: true,
    }
  );

  Lesson.associate = (models) => {
    Lesson.belongsTo(models.Course, {
      foreignKey: { name: "courseId", field: "course_id" },
      as: "course",
    });

    Lesson.belongsTo(models.User, {
      foreignKey: { name: "userId", field: "user_id" },
      as: "author",
    });

    Lesson.belongsTo(Lesson, {
      foreignKey: { name: "unitId", field: "unit_id" },
      as: "unit",
    });

    Lesson.hasMany(Lesson, {
      foreignKey: { name: "unitId", field: "unit_id" },
      as: "subLessons",
    });
  };

  return Lesson;
};
