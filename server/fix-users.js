const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixUsers() {
  try {
    // Check if users exist
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Current users count:', result.rows[0].count);

    // Delete existing users if any (clean slate)
    await pool.query('DELETE FROM users');
    console.log('Cleared existing users');

    // Insert seed data
    await pool.query(`
      INSERT INTO users (username, password_hash, ho_ten, role, email)
      VALUES
      ('admin', '$2b$10$4JspCUXYgMerCRWa1s8t/uCerFqiKUOMB61RA7B3ZPtfaCoot8/c2', 'Admin', 'quan_ly', 'admin@gmail.com'),
      ('nhanvien', '$2b$10$4JspCUXYgMerCRWa1s8t/uCerFqiKUOMB61RA7B3ZPtfaCoot8/c2', 'Nhan Vien', 'nhan_vien', 'nv@gmail.com')
    `);
    console.log('✅ Users inserted successfully!');

    // Verify
    const verify = await pool.query('SELECT id, username, ho_ten, role FROM users');
    console.log('Users in database:', verify.rows);

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

fixUsers();
