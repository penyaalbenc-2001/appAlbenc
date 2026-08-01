import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Entorn serverless: la instancia es congela entre peticions i el pooler de
  // Supabase tanca les connexions inactives. Amb sockets curts i keepAlive
  // evitem tornar a fer servir una connexio ja morta.
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true
});

// Sense este listener, un error en una connexio inactiva es propaga com a
// excepcio no capturada i tomba tot el proces.
pool.on('error', (err) => {
  console.error('Postgres pool error (client inactiu)', err.code, err.message);
});

const TRANSIENT_CODES = new Set([
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  '57P01', // admin_shutdown
  '57P03', // cannot_connect_now
  '08006', // connection_failure
  '08003'  // connection_does_not_exist
]);

function isTransient(err) {
  if (!err) return false;
  if (TRANSIENT_CODES.has(err.code)) return true;
  return /Connection terminated|socket hang up|Client has encountered a connection error/i.test(err.message || '');
}

// Un sol reintent davant d'errors de connexio: quan el socket ja esta mort la
// sentencia no ha arribat mai al servidor, aixi que repetir-la es segur en la
// practica i evita l'error que veien els usuaris al enviar el formulari.
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    console.log('Executed query', { text, duration: Date.now() - start, rows: res.rowCount });
    return res;
  } catch (err) {
    if (!isTransient(err)) throw err;
    console.warn('Query fallida per connexio, reintentant una vegada', err.code, err.message);
    const res = await pool.query(text, params);
    console.log('Executed query (reintent)', { text, duration: Date.now() - start, rows: res.rowCount });
    return res;
  }
}

const db = { query, pool, connect: (...args) => pool.connect(...args), end: () => pool.end() };

export default db;
