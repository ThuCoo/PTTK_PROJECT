import fs from "fs";
import path from "path";
import { query } from "../db";

async function run() {
  try {
    console.log("Loading test SQL...");
    const filePath = path.join(
      __dirname,
      "../../migrations/003_test_data_room_return.sql",
    );
    if (!fs.existsSync(filePath)) {
      console.error("Test SQL file not found:", filePath);
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, "utf-8");
    console.log("Executing test SQL (this may take a moment)...");
    await query(sql);
    console.log("Test data loaded successfully.");
  } catch (err) {
    console.error("Error loading test data:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
