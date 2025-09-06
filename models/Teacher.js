// module.exports = (sequelize, DataTypes) => {
//   const Teachers = sequelize.define(
//     "Teachers",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(191),
//         allowNull: false,
//         unique: true,
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
//       tableName: "Teachers",
//     }
//   );

//   Teachers.associate = (models) => {
//     Teachers.hasMany(models.Courses, {
//       foreignKey: "teacherId",
//       as: "courses",
//     });
//   };

//   return Teachers;
// };





module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    "Teacher",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
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
      tableName: "Teachers",
    }
  );

  Teacher.associate = (models) => {
    Teacher.hasMany(models.Course, {
      foreignKey: "teacherId",
      as: "courses",
    });
  };

  return Teacher;
};
