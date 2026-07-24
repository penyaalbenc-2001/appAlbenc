const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const festes2025 = [
  { fecha: '2025-08-08', cocineros: 'Oscar Vicente, Serafin Montoliu' },
  { fecha: '2025-08-09', cocineros: 'Alfonso Roig, Ana Troncho' }, // Saturday
  { fecha: '2025-08-10', cocineros: 'Miguel A. Monfort, Lucia Carceller' },
  { fecha: '2025-08-11', cocineros: '' }, // DIA DE LES PENYES
  { fecha: '2025-08-12', cocineros: 'Victor Prades, Sara Barcina, J. Fernando Marques' },
  { fecha: '2025-08-13', cocineros: 'David Roig, Carmina Escorihuela' },
  { fecha: '2025-08-14', cocineros: 'J. Ramon Barreda, Carolina De Toro' },
  { fecha: '2025-08-15', cocineros: 'Raul Altaba, Elena Domingo, Victor Zandalinas, Sonia Domingo' },
  { fecha: '2025-08-16', cocineros: 'Luis Belles, Marta Fusté, Alonso Roqueta, Lara Sorribes' }, // Saturday
  { fecha: '2025-08-17', cocineros: 'Francisco Vicente, Sugey Guzman, Diego Tena, Pilar Gimeno' }
];

async function run() {
  try {
    // Check if they exist to avoid duplicates
    for (const f of festes2025) {
      const res = await pool.query("SELECT id FROM comidas WHERE fecha = $1 AND dia = 'Festes'", [f.fecha]);
      if (res.rows.length === 0) {
        await pool.query(
          "INSERT INTO comidas (fecha, dia, cocineros, tipo_comida) VALUES ($1, 'Festes', $2, 'Sopar Festes')",
          [f.fecha, f.cocineros]
        );
        console.log(`Inserted 2025 Festes: ${f.fecha}`);
      } else {
        await pool.query(
          "UPDATE comidas SET cocineros = $1 WHERE fecha = $2 AND dia = 'Festes'",
          [f.cocineros, f.fecha]
        );
        console.log(`Updated 2025 Festes: ${f.fecha}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
