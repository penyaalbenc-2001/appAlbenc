const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tables.map(t => t.table_name));

    for (const table of tables) {
      const { rows: columns } = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table.table_name]);
      console.log(`\nTable ${table.table_name} columns:`);
      console.log(columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
    
    // Check members if a likely table exists
    const likelyTables = tables.map(t => t.table_name).filter(t => t.includes('miembro') || t.includes('socios') || t.includes('usuarios') || t.includes('members'));
    for (const lt of likelyTables) {
      const { rows } = await pool.query(`SELECT * FROM ${lt}`);
      console.log(`\nData in ${lt}:`, rows);
    }
    
    // Check if there is an auth.users or similar
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
