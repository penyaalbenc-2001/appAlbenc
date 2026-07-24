'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getRegisteredUsers() {
  try {
    const { rows } = await db.query(`
      SELECT 
        m.id as membre_id, 
        m.nom, 
        u.email, 
        u.created_at, 
        u.id as auth_id 
      FROM membres m 
      JOIN auth.users u ON m.usuari_id_auth = u.id 
      ORDER BY u.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error al carregar els usuaris');
  }
}

export async function deleteUser(authId, membreId, adminEmail, nomUsuari) {
  try {
    // 1. Unlink in the public.membres table
    await db.query('UPDATE membres SET usuari_id_auth = NULL WHERE id = $1', [membreId]);
    
    // 2. Delete from auth.users
    await db.query('DELETE FROM auth.users WHERE id = $1', [authId]);

    // 3. Register activity
    await registrarActivitat(
      'Administrador', 
      'Admin', 
      `ha eliminat l'usuari de ${nomUsuari}.`,
      `⚠️ <b>Avís d'Administració</b>\n\nL'administrador ha eliminat el compte de: <b>${nomUsuari}</b>.`
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error("Error al eliminar l'usuari");
  }
}
