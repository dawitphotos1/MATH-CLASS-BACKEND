// scripts/approvePendingEnrollments.js
import db from "../models/index.js";

const { Enrollment } = db;

const approvePendingEnrollments = async () => {
  try {
    console.log("🚀 Starting migration: approving pending enrollments...");

    // Update all pending enrollments to approved
    const [updatedCount] = await Enrollment.update(
      { approval_status: "approved" },
      { where: { approval_status: "pending" } }
    );

    console.log(`✅ Migration complete: ${updatedCount} enrollments updated.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

approvePendingEnrollments();
