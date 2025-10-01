// scripts/reset-db.js
import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

const commands = [
  `npx sequelize-cli db:migrate:undo:all || true`,
  `npx sequelize-cli db:seed:undo:all || true`,
  `psql "${dbUrl}" -c "DROP TABLE IF EXISTS \\"SequelizeMeta\\";"`,
  `npx sequelize-cli db:migrate`,
  `npx sequelize-cli db:seed:all`,
];

function run(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.error(stderr);
      console.log(stdout);
      resolve();
    });
  });
}

(async () => {
  try {
    for (const cmd of commands) {
      await run(cmd);
    }
    console.log("✅ Database reset complete!");
  } catch (err) {
    console.error("🔥 Reset failed:", err);
    process.exit(1);
  }
})();
