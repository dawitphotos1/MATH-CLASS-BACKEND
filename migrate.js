require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

console.log("DEBUG: DATABASE_URL =", process.env.DATABASE_URL);
console.log("DEBUG: NODE_ENV =", process.env.NODE_ENV);

const { execSync } = require("child_process");

try {
  execSync("npx sequelize-cli db:migrate --env development", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
  console.log("✅ Migrations completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}
