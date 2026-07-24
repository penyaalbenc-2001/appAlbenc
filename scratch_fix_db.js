import db from './src/lib/db.js';

async function fixTable() {
  try {
    // 1. First, create a temporary sequence
    await db.query(`CREATE SEQUENCE IF NOT EXISTS lista_compra_id_seq START WITH 3;`);
    
    // 2. Update existing rows that have null id
    await db.query(`UPDATE lista_compra SET id = nextval('lista_compra_id_seq') WHERE id IS NULL;`);
    
    // 3. Alter column to use the sequence by default
    await db.query(`ALTER TABLE lista_compra ALTER COLUMN id SET DEFAULT nextval('lista_compra_id_seq');`);
    
    // 4. Ensure it's not null and primary key (if not already)
    await db.query(`ALTER TABLE lista_compra ALTER COLUMN id SET NOT NULL;`);
    
    try {
      await db.query(`ALTER TABLE lista_compra ADD PRIMARY KEY (id);`);
    } catch (e) {
      console.log('Primary key might already exist:', e.message);
    }

    console.log("Database table fixed!");
    
    // 5. Verify the data
    const res = await db.query('SELECT * FROM lista_compra ORDER BY id');
    console.log('Current rows:', res.rows);
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    process.exit(0);
  }
}

fixTable();
