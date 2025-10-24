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


// models/courseModel.js
import mongoose from "mongoose";
import slugify from "slugify";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: 0,
    },

    category: {
      type: String,
      default: "Mathematics",
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    duration: {
      type: String,
      default: "Self-paced",
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    image: {
      type: String,
      default: "/math-logos/default-course.jpg",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Auto-generate a URL slug from the title
courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// ✅ Add a safe version of toJSON (remove sensitive or large fields)
courseSchema.methods.toJSON = function () {
  const course = this.toObject();
  delete course.__v;
  return course;
};

const Course = mongoose.model("Course", courseSchema);

export default Course;
