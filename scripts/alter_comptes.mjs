import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function alterTable() {
  const query = `
    ALTER TABLE comptes ADD COLUMN IF NOT EXISTS adjunt VARCHAR(1000);
  `;
  try {
    await pool.query(query);
    console.log("Column 'adjunt' added successfully.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    pool.end();
  }
}

alterTable();
