const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function getFestesDates(year) {
  // Aug 15th
  let start = new Date(year, 7, 15);
  // Find Friday before
  while (start.getDay() !== 5) { // 5 is Friday
    start.setDate(start.getDate() - 1);
  }
  if (start.getDate() === 15) {
    start.setDate(start.getDate() - 7);
  }

  // Find Sunday after
  let end = new Date(year, 7, 15);
  while (end.getDay() !== 0) { // 0 is Sunday
    end.setDate(end.getDate() + 1);
  }
  if (end.getDate() === 15) {
    end.setDate(end.getDate() + 7);
  }

  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    // Correct for timezone offset when formatting
    const local = new Date(current.getTime() - (current.getTimezoneOffset() * 60000));
    dates.push(local.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

async function insertFestes() {
  const year = 2026; // Current year context
  const dates = getFestesDates(year);
  console.log(`Dates calculated for Festes ${year}:`, dates);

  try {
    for (const date of dates) {
      // Check if it already exists
      const { rows } = await pool.query("SELECT * FROM comidas WHERE fecha = $1 AND dia = 'Festes'", [date]);
      if (rows.length === 0) {
        await pool.query(
          "INSERT INTO comidas (fecha, hora, lugar, cocineros, informacion, estado, dia, tipo_comida) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [date, "21:30", "El local", "", "Sopar de Festes d'Agost", "programada", "Festes", "Cena"]
        );
        console.log(`Inserted ${date}`);
      } else {
        console.log(`Already exists ${date}`);
      }
    }
  } catch (e) {
    console.error("Error inserting", e);
  } finally {
    process.exit(0);
  }
}

insertFestes();
