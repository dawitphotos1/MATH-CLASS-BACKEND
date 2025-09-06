
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




// models/lesson.js
module.exports = (sequelize, DataTypes) => {
  const Lesson = sequelize.define(
    "Lesson",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: DataTypes.TEXT,
      video_url: DataTypes.STRING,
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "lessons", // Explicitly set the table name to match DB table
      freezeTableName: true,
      underscored: true, // Maps camelCase JS props to snake_case DB columns
      timestamps: true, // Enable Sequelize's auto timestamps (createdAt/updatedAt)
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Optional associations can be defined here
  Lesson.associate = function(models) {
    Lesson.belongsTo(models.Course, { foreignKey: 'course_id' });
  };

  return Lesson;
};
