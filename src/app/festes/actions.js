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
    await registrarActivitat(
      userNom,
      'Festes',
      `ha actualitzat el menú de Festes (${rows[0].fecha}).`,
      `🥘 <b>Menú de Festes actualitzat</b>\n\n${userNom} ha actualitzat el menú del dia ${rows[0].fecha}.\n\n📋 Nou menú: ${menu || '-'}`
    );
  }
}

export async function updateComensalsFesta(id, comensalsStr, userNom) {
  const { rows } = await db.query(
    "UPDATE comidas SET participantes = $1 WHERE id = $2 RETURNING fecha",
    [comensalsStr, id]
  );
  if (rows.length > 0) {
    const comensals = comensalsStr
      ? comensalsStr.split(',').map((c) => c.trim()).filter(Boolean)
      : [];
    await registrarActivitat(
      userNom,
      'Festes',
      `ha actualitzat la llista de comensals de Festes (${rows[0].fecha}).`,
      `🍽️ <b>Comensals de Festes actualitzats</b>\n\n${userNom} ha actualitzat els comensals del dia ${rows[0].fecha}.\n\n👥 Comensals (${comensals.length}): ${comensals.length ? comensals.join(', ') : 'Cap'}`
    );
  }
}
