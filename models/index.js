
// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

import UserModel from "./User.js";
import CourseModel from "./Course.js";
import LessonModel from "./Lesson.js";
import EnrollmentModel from "./Enrollment.js";
import UserCourseAccessModel from "./UserCourseAccess.js";

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Lesson = LessonModel(sequelize, DataTypes);
const Enrollment = EnrollmentModel(sequelize, DataTypes);
const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);

// Associations
Object.values({ User, Course, Lesson, Enrollment, UserCourseAccess }).forEach((model) => {
  if (model.associate) {
    model.associate({ User, Course, Lesson, Enrollment, UserCourseAccess });
  }
});

export { sequelize, User, Course, Lesson, Enrollment, UserCourseAccess };
export default { sequelize, User, Course, Lesson, Enrollment, UserCourseAccess };
