const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const membresNoms = [
  'Alfonso',
  'Juan Fernando',
  'Oscar',
  'Serafin',
  'Alonso',
  'Victor M.',
  'Juan Ramon',
  'Miguel A.',
  'Diego',
  'Luis',
  'Raul A.',
  'Victor Z.',
  'David',
  'Xisco'
];

async function createMembersTable() {
  try {
    console.log('Creant taula membres...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS membres (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) UNIQUE NOT NULL,
        usuari_id_auth UUID UNIQUE
      );
    `);
    
    console.log('Inserint membres...');
    for (const nom of membresNoms) {
      await pool.query(`
        INSERT INTO membres (nom) 
        VALUES ($1) 
        ON CONFLICT (nom) DO NOTHING;
      `, [nom]);
    }
    
    console.log('Taula membres creada i poblada correctament.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

createMembersTable();
