'use server';

import db from '@/lib/db';

export async function getMembreByUserId(userId) {
  try {
    const { rows } = await db.query('SELECT nom FROM membres WHERE usuari_id_auth = $1', [userId]);
    if (rows.length > 0) return rows[0];
    return null;
  } catch (error) {
    console.error('Error fetching member by user ID:', error);
    return null;
  }
}
