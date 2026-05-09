const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "homestay_dorm",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
    });

async function run() {
  const res = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
  );
  console.log(res.rows.map((r) => r.table_name).join(", "));
  process.exit(0);
}
run();
