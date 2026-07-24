import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const { rows } = await pool.query('SELECT usuario, descripcion FROM cambios ORDER BY id DESC LIMIT 10');
  console.log(rows);
  process.exit();
}
main();
