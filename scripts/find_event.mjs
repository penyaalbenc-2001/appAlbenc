import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function queryDB() {
  try {
    const { rows } = await pool.query("SELECT * FROM eventos WHERE fecha = '2026-02-23' OR evento ILIKE '%derrama%'");
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

queryDB();
