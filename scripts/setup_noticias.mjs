import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupNoticias() {
  const query = `
    CREATE TABLE IF NOT EXISTS noticias (
      id SERIAL PRIMARY KEY,
      fecha_scraping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      titulo VARCHAR(500),
      link VARCHAR(1000) UNIQUE,
      imagen VARCHAR(1000),
      resumen TEXT,
      origen VARCHAR(100),
      fecha_evento VARCHAR(100),
      lugar VARCHAR(255),
      precio VARCHAR(100),
      tipo VARCHAR(100)
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'noticias' configured successfully.");
  } catch (err) {
    console.error("Error configuring table:", err);
  } finally {
    pool.end();
  }
}

setupNoticias();
