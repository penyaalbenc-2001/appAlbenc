const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function resetAdmin() {
  try {
    await pool.query("UPDATE membres SET usuari_id_auth = NULL WHERE nom = 'Administrador'");
    console.log("Administrador reset successful");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

resetAdmin();
