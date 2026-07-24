import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await pool.query("UPDATE membres SET usuari_id_auth = NULL WHERE nom = 'Victor Z.'");
  console.log("Victor Z. reset successfully");
  process.exit();
}
main();
