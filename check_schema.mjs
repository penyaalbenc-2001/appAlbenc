import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const res = await db.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'membres\'');
    console.log(res.rows);
    
    // Check if 'idioma' exists
    const hasIdioma = res.rows.some(r => r.column_name === 'idioma');
    if (!hasIdioma) {
       console.log('Adding "idioma" column to membres...');
       await db.query('ALTER TABLE membres ADD COLUMN idioma VARCHAR(10) DEFAULT \'ca\'');
       console.log('Column added.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

main();
