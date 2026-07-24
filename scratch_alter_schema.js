const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function alterTables() {
  try {
    console.log('Altering lista_compra...');
    await pool.query(`
      ALTER TABLE lista_compra
      ADD COLUMN IF NOT EXISTS cantidad VARCHAR(100),
      ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'pendent',
      ADD COLUMN IF NOT EXISTS usuario VARCHAR(100)
    `);

    console.log('Altering eventos...');
    await pool.query(`
      ALTER TABLE eventos
      ADD COLUMN IF NOT EXISTS hora VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ubicacion TEXT,
      ADD COLUMN IF NOT EXISTS descripcion TEXT,
      ADD COLUMN IF NOT EXISTS participantes TEXT
    `);
    
    // Also add to comidas just in case
    console.log('Altering comidas...');
    await pool.query(`
      ALTER TABLE comidas
      ADD COLUMN IF NOT EXISTS participantes TEXT,
      ADD COLUMN IF NOT EXISTS lugar TEXT,
      ADD COLUMN IF NOT EXISTS hora VARCHAR(50),
      ADD COLUMN IF NOT EXISTS informacion TEXT,
      ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'programada'
    `);

    console.log('Tables altered successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

alterTables();
