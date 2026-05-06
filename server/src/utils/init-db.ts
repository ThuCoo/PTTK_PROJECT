import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Connect to default 'postgres' db first to create 'homestay_dorm' if it doesn't exist
  database: 'postgres',
});

async function initDB() {
  try {
    const dbName = process.env.DB_NAME || 'homestay_dorm';
    console.log(`Checking if database ${dbName} exists...`);
    const res = await pool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log('Database created successfully.');
    } else {
      console.log('Database already exists.');
    }
    await pool.end();

    // Connect to the new DB and run migration
    console.log('Running migrations...');
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    });

    const migrationPath = path.join(__dirname, '../../migrations/001_init.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    await appPool.query(sql);
    console.log('Migrations applied successfully. Database is seeded and ready to use!');
    await appPool.end();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
