// // models/Teacher.js
// const TeacherModel = (sequelize, DataTypes) => {
//   const Teacher = sequelize.define("Teacher", {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     // Add any other fields specific to teachers here
//   });

//   Teacher.associate = (models) => {
//     Teacher.hasMany(models.Course, { foreignKey: "teacherId" });
//   };

//   return Teacher;
// };

// export default TeacherModel;




// models/Teacher.js
export default (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    "Teacher",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "user_id",
      },
    },
    {
      tableName: "teachers",
      underscored: true,
      timestamps: true,
    }
  );

  Teacher.associate = (models) => {
    // Link to User
    Teacher.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    // Optional: if you want reverse association
    models.User.hasOne(Teacher, {
      foreignKey: "user_id",
      as: "teacherProfile",
    });
  };

  return Teacher;
};
