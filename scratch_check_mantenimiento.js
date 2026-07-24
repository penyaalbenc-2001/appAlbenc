const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkMantenimiento() {
  try {
    const { rows } = await pool.query("SELECT * FROM mantenimiento ORDER BY id DESC LIMIT 5");
    console.log("Mantenimiento:", rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkMantenimiento();
