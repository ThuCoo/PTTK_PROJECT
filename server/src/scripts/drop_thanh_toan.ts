import { query } from "../db";

async function run() {
  try {
    console.log("Dropping table thanh_toan if it exists...");
    await query("DROP TABLE IF EXISTS thanh_toan CASCADE");
    console.log("Dropped (if existed).");
  } catch (err) {
    console.error("Error dropping thanh_toan:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
