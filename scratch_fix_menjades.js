import db from './src/lib/db.js';

async function fixTable() {
  try {
    const res = await db.query('SELECT max(id) as max_id FROM comidas WHERE id IS NOT NULL');
    const startId = res.rows[0].max_id ? parseInt(res.rows[0].max_id) + 1 : 1;
    console.log(`Starting sequence at ${startId}`);

    await db.query(`CREATE SEQUENCE IF NOT EXISTS comidas_id_seq START WITH ${startId};`);
    
    // Some IDs might be null, update them with the sequence
    await db.query(`UPDATE comidas SET id = nextval('comidas_id_seq') WHERE id IS NULL;`);
    
    // Set default and primary key
    await db.query(`ALTER TABLE comidas ALTER COLUMN id SET DEFAULT nextval('comidas_id_seq');`);
    await db.query(`ALTER TABLE comidas ALTER COLUMN id SET NOT NULL;`);
    
    try {
      await db.query(`ALTER TABLE comidas ADD PRIMARY KEY (id);`);
    } catch (e) {
      console.log('Primary key might already exist:', e.message);
    }

    console.log("Database table comidas fixed!");
    
    // Verify
    const res2 = await db.query('SELECT * FROM comidas ORDER BY id DESC LIMIT 5');
    console.log('Current rows:', res2.rows);
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    process.exit(0);
  }
}

fixTable();
