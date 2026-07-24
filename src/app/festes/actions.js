'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getDiesFestesAmbDades() {
  const currentYear = new Date().getFullYear().toString();
  
  const { rows: meals } = await db.query(
    "SELECT id, fecha, tipo_comida, informacion, cocineros FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1 ORDER BY fecha ASC",
    [`${currentYear}%`]
  );
  
  const { rows: assistances } = await db.query("SELECT nom_cognoms, dies_sopar FROM festes_assistencia");

  return meals.map(meal => {
    const comensals = assistances.filter(a => {
      try {
        const dies = typeof a.dies_sopar === 'string' ? JSON.parse(a.dies_sopar) : a.dies_sopar;
        return Array.isArray(dies) && dies.includes(meal.fecha);
      } catch (e) {
        return false;
      }
    }).map(a => a.nom_cognoms);

    return {
      ...meal,
      participantes: comensals.join(', ')
    };
  });
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

export async function updateFestesCooks(id, newCooksString, oldCooksString, userNom) {
  const { rows } = await db.query(
    "UPDATE comidas SET cocineros = $1 WHERE id = $2 RETURNING fecha",
    [newCooksString, id]
  );
  if (rows.length > 0) {
    await registrarActivitat(
      userNom,
      'Festes',
      `ha modificat els cuiners de Festes (${rows[0].fecha}).`,
      `👨‍🍳 <b>Cuiners de Festes actualitzats</b>\n\n${userNom} ha modificat els cuiners del dia ${rows[0].fecha}.\n\n❌ Abans: ${oldCooksString || 'Cap'}\n✅ Ara: ${newCooksString || 'Cap'}`
    );
  }
}

