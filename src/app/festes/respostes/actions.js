'use server';

import db from '@/lib/db';

export async function getRespostes() {
  const { rows } = await db.query("SELECT * FROM festes_assistencia ORDER BY es_adult DESC, nom_cognoms ASC");
  return rows;
}

export async function deleteResposta(id) {
  const { rows } = await db.query("DELETE FROM festes_assistencia WHERE id = $1 RETURNING *", [id]);
  return rows[0];
}
