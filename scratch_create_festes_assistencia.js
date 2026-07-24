const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS festes_assistencia (
        id SERIAL PRIMARY KEY,
        nom_cognoms VARCHAR(100) NOT NULL,
        es_adult BOOLEAN NOT NULL,
        dies_sopar JSONB DEFAULT '[]',
        dies_cuinar JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'festes_assistencia' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit(0);
  }
}

run();
