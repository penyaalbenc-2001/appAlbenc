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

export async function updateResposta(id, nom_cognoms, es_adult, dies_sopar, dies_cuinar) {
  const { rows } = await db.query(
    "UPDATE festes_assistencia SET nom_cognoms = $1, es_adult = $2, dies_sopar = $3, dies_cuinar = $4 WHERE id = $5 RETURNING *",
    [nom_cognoms, es_adult, JSON.stringify(dies_sopar), JSON.stringify(dies_cuinar), id]
  );
  return rows[0];
}
