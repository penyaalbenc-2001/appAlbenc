import db from './src/lib/db.js';

async function checkAuthUsers() {
  try {
    const res = await db.query('SELECT id, email, created_at FROM auth.users LIMIT 2');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkAuthUsers();
