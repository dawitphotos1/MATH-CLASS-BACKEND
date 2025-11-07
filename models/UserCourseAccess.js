// // models/UserCourseAccess.js
// export default (sequelize, DataTypes) => {
//   const UserCourseAccess = sequelize.define(
//     "UserCourseAccess",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: "users", key: "id" },
//         onDelete: "CASCADE",
//       },
//       course_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: "courses", key: "id" },
//         onDelete: "CASCADE",
//       },
//       approval_status: {
//         type: DataTypes.ENUM("pending", "approved", "rejected"),
//         defaultValue: "pending",
//       },
//       payment_status: {
//         type: DataTypes.ENUM("pending", "paid", "failed"),
//         defaultValue: "pending",
//       },
//       access_granted_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//     },
//     {
//       tableName: "user_course_accesses",
//       underscored: true, // uses created_at / updated_at automatically
//       timestamps: true,
//       createdAt: "created_at",
//       updatedAt: "updated_at",
//     }
//   );

//   UserCourseAccess.associate = (models) => {
//     UserCourseAccess.belongsTo(models.User, {
//       foreignKey: "user_id",
//       as: "student",
//     });
//     UserCourseAccess.belongsTo(models.Course, {
//       foreignKey: "course_id",
//       as: "course",
//     });
//   };

//   return UserCourseAccess;
// };





// models/UserCourseAccess.js
export default (sequelize, DataTypes) => {
  const UserCourseAccess = sequelize.define(
    "UserCourseAccess",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "courses", key: "id" },
        onDelete: "CASCADE",
      },
      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      access_granted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_course_accesses",
      underscored: true,
      timestamps: true,
    }
  );

  UserCourseAccess.associate = (models) => {
    UserCourseAccess.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "student",
    });

    UserCourseAccess.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });
  };

  return UserCourseAccess;
};