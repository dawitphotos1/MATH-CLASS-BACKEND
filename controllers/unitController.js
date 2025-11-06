// import db from "../models/index.js";
// const { Unit, Course, Lesson } = db;

// export const createUnit = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { title, description, orderIndex } = req.body;

//     console.log("📦 Creating unit for course:", courseId, "Title:", title);

//     // Validate course exists
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Check authorization
//     if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to create units for this course",
//       });
//     }

//     // Get order index if not provided
//     let orderIndexValue = orderIndex;
//     if (!orderIndexValue && orderIndexValue !== 0) {
//       const lastUnit = await Unit.findOne({
//         where: { course_id: courseId },
//         order: [["order_index", "DESC"]],
//       });
//       orderIndexValue = lastUnit ? lastUnit.order_index + 1 : 1;
//     }

//     const unit = await Unit.create({
//       course_id: courseId,
//       title: title.trim(),
//       description: description?.trim() || "",
//       order_index: orderIndexValue,
//     });

//     console.log("✅ Unit created:", unit.id);

//     res.status(201).json({
//       success: true,
//       message: "Unit created successfully",
//       unit: {
//         id: unit.id,
//         title: unit.title,
//         description: unit.description,
//         order_index: unit.order_index,
//         course_id: unit.course_id,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating unit:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to create unit",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// export const getUnitsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("📚 Fetching units for course:", courseId);

//     const units = await Unit.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           association: "lessons",
//           attributes: ["id", "title", "order_index", "content_type"],
//           order: [["order_index", "ASC"]],
//         },
//       ],
//     });

//     console.log(`✅ Found ${units.length} units for course ${courseId}`);

//     res.json({
//       success: true,
//       units: units || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching units:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch units",
//     });
//   }
// };

// export const updateUnit = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     const { title, description, orderIndex } = req.body;

//     const unit = await Unit.findByPk(unitId, {
//       include: [
//         {
//           association: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!unit) {
//       return res.status(404).json({
//         success: false,
//         error: "Unit not found",
//       });
//     }

//     // Check authorization
//     if (req.user.role !== "admin" && unit.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this unit",
//       });
//     }

//     unit.title = title || unit.title;
//     unit.description = description || unit.description;
//     if (orderIndex !== undefined) unit.order_index = orderIndex;

//     await unit.save();

//     res.json({
//       success: true,
//       message: "Unit updated successfully",
//       unit,
//     });
//   } catch (error) {
//     console.error("❌ Error updating unit:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update unit",
//     });
//   }
// };

// export const deleteUnit = async (req, res) => {
//   try {
//     const { unitId } = req.params;

//     const unit = await Unit.findByPk(unitId, {
//       include: [
//         {
//           association: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!unit) {
//       return res.status(404).json({
//         success: false,
//         error: "Unit not found",
//       });
//     }

//     // Check authorization
//     if (req.user.role !== "admin" && unit.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this unit",
//       });
//     }

//     await unit.destroy();

//     res.json({
//       success: true,
//       message: "Unit deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting unit:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete unit",
//     });
//   }
// };




import db from "../models/index.js";
const { Unit, Course, Lesson } = db;

export const createUnit = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, orderIndex } = req.body;

    console.log("📦 Creating unit for course:", courseId, "Title:", title);

    // Validate course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create units for this course",
      });
    }

    // Get order index if not provided
    let orderIndexValue = orderIndex;
    if (!orderIndexValue && orderIndexValue !== 0) {
      const lastUnit = await Unit.findOne({
        where: { course_id: courseId },
        order: [["order_index", "DESC"]],
      });
      orderIndexValue = lastUnit ? lastUnit.order_index + 1 : 1;
    }

    const unit = await Unit.create({
      course_id: courseId,
      title: title.trim(),
      description: description?.trim() || "",
      order_index: orderIndexValue,
    });

    console.log("✅ Unit created:", unit.id);

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      unit: {
        id: unit.id,
        title: unit.title,
        description: unit.description,
        order_index: unit.order_index,
        course_id: unit.course_id,
        created_at: unit.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error creating unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create unit",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getUnitsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("📚 Fetching units for course:", courseId);

    const units = await Unit.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [
        {
          association: "lessons",
          attributes: ["id", "title", "order_index", "content_type"],
          order: [["order_index", "ASC"]],
        },
      ],
    });

    console.log(`✅ Found ${units.length} units for course ${courseId}`);

    res.json({
      success: true,
      units: units || [],
    });
  } catch (error) {
    console.error("❌ Error fetching units:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch units",
    });
  }
};

export const getUnitById = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findByPk(unitId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "order_index", "content_type"],
          order: [["order_index", "ASC"]],
        },
      ],
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: "Unit not found",
      });
    }

    res.json({
      success: true,
      unit,
    });
  } catch (error) {
    console.error("❌ Error fetching unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch unit",
    });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description, orderIndex } = req.body;

    const unit = await Unit.findByPk(unitId, {
      include: [
        {
          association: "course",
          attributes: ["id", "teacher_id"],
        },
      ],
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: "Unit not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && unit.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this unit",
      });
    }

    unit.title = title || unit.title;
    unit.description = description || unit.description;
    if (orderIndex !== undefined) unit.order_index = orderIndex;

    await unit.save();

    res.json({
      success: true,
      message: "Unit updated successfully",
      unit,
    });
  } catch (error) {
    console.error("❌ Error updating unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update unit",
    });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findByPk(unitId, {
      include: [
        {
          association: "course",
          attributes: ["id", "teacher_id"],
        },
      ],
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: "Unit not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && unit.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this unit",
      });
    }

    await unit.destroy();

    res.json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete unit",
    });
  }
};