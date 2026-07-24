const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkComidas() {
  try {
    const { rows } = await pool.query("SELECT id, fecha, tipo_comida FROM comidas ORDER BY id DESC LIMIT 5");
    console.log("Comidas:", rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkComidas();
