'use server';

import db from '@/lib/db';

export async function getRespostes() {
  const { rows } = await db.query("SELECT * FROM festes_assistencia ORDER BY es_adult DESC, nom_cognoms ASC");
  return rows;
}
