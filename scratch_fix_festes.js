const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixFestes() {
  const year = 2026;
  
  // 1. Delete previous Festes inserted by mistake
  await pool.query("DELETE FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1", [`${year}%`]);
  console.log("Deleted old Festes for 2026");

  // 2. Calculate correct dates
  // Rule: Ends on the first Sunday on or after Aug 15. Starts exactly 9 days before (Friday).
  let end = new Date(year, 7, 15);
  while (end.getDay() !== 0) { // 0 is Sunday
    end.setDate(end.getDate() + 1);
  }
  
  let start = new Date(end);
  start.setDate(start.getDate() - 9); // 9 days before Sunday is Friday

  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    // Correct for timezone offset when formatting
    const local = new Date(current.getTime() - (current.getTimezoneOffset() * 60000));
    dates.push(local.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  console.log("New Festes Dates:", dates);

  // 3. Insert them
  try {
    for (const date of dates) {
      await pool.query(
        "INSERT INTO comidas (fecha, hora, lugar, cocineros, informacion, estado, dia, tipo_comida) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [date, "21:30", "El local", "", "Sopar de Festes d'Agost", "programada", "Festes", "Cena"]
      );
      console.log(`Inserted ${date}`);
    }
  } catch (e) {
    console.error("Error inserting", e);
  } finally {
    process.exit(0);
  }
}

fixFestes();
