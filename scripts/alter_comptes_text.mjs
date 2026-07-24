import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function alterTable() {
  const query = `
    ALTER TABLE comptes ALTER COLUMN adjunt TYPE TEXT;
  `;
  try {
    await pool.query(query);
    console.log("Column 'adjunt' altered to TEXT successfully.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    pool.end();
  }
}

alterTable();
