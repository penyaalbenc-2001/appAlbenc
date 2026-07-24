const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAdmin() {
  try {
    const { rows } = await pool.query("SELECT * FROM membres WHERE nom = 'Administrador'");
    console.log("Administrador row:", rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
