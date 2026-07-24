'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getDiesFestesAmbDades() {
  const currentYear = new Date().getFullYear().toString();
  const { rows } = await db.query(
    "SELECT id, fecha, tipo_comida, informacion, participantes, cocineros FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1 ORDER BY fecha ASC",
    [`${currentYear}%`]
  );
  return rows;
}

export async function updateMenuFesta(id, menu, userNom) {
  const { rows } = await db.query(
    "UPDATE comidas SET informacion = $1 WHERE id = $2 RETURNING fecha",
    [menu, id]
  );
  if (rows.length > 0) {
    await registrarActivitat(`Ha actualitzat el menú de Festes (${rows[0].fecha}).`, userNom);
  }
}

export async function updateComensalsFesta(id, comensalsStr, userNom) {
  const { rows } = await db.query(
    "UPDATE comidas SET participantes = $1 WHERE id = $2 RETURNING fecha",
    [comensalsStr, id]
  );
  if (rows.length > 0) {
    await registrarActivitat(`Ha actualitzat la llista de comensals de Festes (${rows[0].fecha}).`, userNom);
  }
}
