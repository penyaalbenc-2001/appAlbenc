import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const { rows } = await pool.query('SELECT * FROM membres ORDER BY nom ASC');
  console.log(rows);
  process.exit();
}
main();
