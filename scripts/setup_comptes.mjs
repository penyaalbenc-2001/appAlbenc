import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS comptes (
      id SERIAL PRIMARY KEY,
      concepte VARCHAR(255) NOT NULL,
      import NUMERIC(10, 2) NOT NULL,
      tipus VARCHAR(50) NOT NULL,
      data DATE NOT NULL,
      membre_nom VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'comptes' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    pool.end();
  }
}

createTable();
