'use server';

import db from '@/lib/db';

export async function getDiesFestes() {
  // force recompile
  const currentYear = new Date().getFullYear().toString();
  // Ocultar Dia de les Penyes (no es cuina, es dina tots junts i no cal formulari)
  const { rows } = await db.query(
    "SELECT id, fecha, tipo_comida FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1 ORDER BY fecha ASC",
    [`${currentYear}%`]
  );
  return rows;
}

// L'enviament del formulari public viu a /api/festes/formulari (route handler),
// perque un Server Action deixa de funcionar si el client te un build antic.
