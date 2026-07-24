import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function moveDerrama() {
  try {
    // 1. Insert into comptes
    const concepte = "Derrama: Derrama Febrer (50€ x 15 socis)";
    const importValor = 50 * 15; // 750
    const tipus = 'ingres';
    const data = '2026-02-23';
    const membre = 'Administrador';

    await pool.query(
      "INSERT INTO comptes (concepte, import, tipus, data, membre_nom) VALUES ($1, $2, $3, $4, $5)",
      [concepte, importValor, tipus, data, membre]
    );

    // 2. Delete from eventos (ID 8)
    await pool.query("DELETE FROM eventos WHERE id = 8");
    
    console.log("Moved Derrama successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

moveDerrama();
