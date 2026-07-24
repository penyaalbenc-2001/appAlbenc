const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addAdmin() {
  try {
    await pool.query("INSERT INTO membres (nom) VALUES ('Administrador')");
    console.log("Admin inserted");
  } catch (e) {
    if (e.code === '23505') console.log("Already exists");
    else console.error(e);
  } finally {
    process.exit(0);
  }
}
addAdmin();
