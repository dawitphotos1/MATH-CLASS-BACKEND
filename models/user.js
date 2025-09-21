
// import { DataTypes } from "sequelize";

// export default (sequelize) => {
//   const User = sequelize.define("User", {
//     name: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, unique: true, allowNull: false },
//     password: { type: DataTypes.STRING, allowNull: false },
//     role: {
//       type: DataTypes.ENUM("admin", "teacher", "student"),
//       allowNull: false,
//     },
//     approval_status: {
//       type: DataTypes.ENUM("pending", "approved", "rejected"),
//       defaultValue: "pending",
//     },
//     subject: { type: DataTypes.STRING, allowNull: true },
//     avatar: { type: DataTypes.STRING, allowNull: true },
//     last_login: { type: DataTypes.DATE, allowNull: true },
//   });

//   User.associate = (models) => {
//     User.hasMany(models.Course, { foreignKey: "teacherId" });
//     User.belongsToMany(models.Course, {
//       through: models.Enrollment,
//       foreignKey: "studentId",
//     });
//   };

//   return User;
// };




// // models/User.js
// import { DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// const User = sequelize.define("User", {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   role: {
//     type: DataTypes.ENUM("student", "teacher", "admin"),
//     allowNull: false,
//     defaultValue: "student",
//   },
//   subject: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   approval_status: {
//     type: DataTypes.ENUM("pending", "approved", "rejected"),
//     defaultValue: "pending",
//   },
// });

// export default User;





// models/User.js

const UserModel = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "teacher", "admin"),
      allowNull: false,
      defaultValue: "student",
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  });

  return User;
};

export default UserModel;
