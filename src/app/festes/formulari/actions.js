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

export async function submitFormulari(data) {
  const { nomCognoms, esAdult, diesSopar, diesCuinar } = data;
  
  const { rows } = await db.query(
    "INSERT INTO festes_assistencia (nom_cognoms, es_adult, dies_sopar, dies_cuinar) VALUES ($1, $2, $3, $4) RETURNING *",
    [nomCognoms, esAdult, JSON.stringify(diesSopar), JSON.stringify(diesCuinar)]
  );
  return rows[0];
}
