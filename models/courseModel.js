// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: "",
//     },
//     price: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     teacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     slug: {
//       type: String,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// const Course = mongoose.model("Course", courseSchema);

// export default Course;




import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
