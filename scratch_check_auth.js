const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkAuthUser() {
  try {
    const { rows: userRows } = await pool.query("SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'penyaalbenc@gmail.com'");
    console.log("Auth users:", userRows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

checkAuthUser();
