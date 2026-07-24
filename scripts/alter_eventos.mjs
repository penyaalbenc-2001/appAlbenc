import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function alterTable() {
  const query = `
    ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fecha_fin DATE;
  `;
  try {
    await pool.query(query);
    console.log("Column 'fecha_fin' added successfully.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    pool.end();
  }
}

alterTable();
