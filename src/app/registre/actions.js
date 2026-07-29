'use server';

import db from '@/lib/db';

export async function getMembresDisponibles() {
  try {
    const { rows } = await db.query('SELECT id, nom FROM membres WHERE usuari_id_auth IS NULL ORDER BY nom ASC');
    return rows;
  } catch (error) {
    console.error('Error fetching membres:', error);
    throw new Error('Error al carregar membres');
  }
}

export async function assignarMembre(membreId, userIdAuth, idioma = 'ca') {
  try {
    // Check if the member is still available
    const { rows } = await db.query('SELECT usuari_id_auth FROM membres WHERE id = $1', [membreId]);
    if (rows.length === 0) throw new Error('Membre no trobat');
    if (rows[0].usuari_id_auth) throw new Error('Aquest membre ja està assignat a un altre compte');

    await db.query('UPDATE membres SET usuari_id_auth = $1, idioma = $2 WHERE id = $3', [userIdAuth, idioma, membreId]);
    return { success: true };
  } catch (error) {
    console.error('Error assigning membre:', error);
    throw new Error(error.message);
  }
}
