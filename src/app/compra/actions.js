'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getCompraItems() {
  const { rows } = await db.query("SELECT * FROM lista_compra ORDER BY id DESC");
  return rows;
}

export async function addCompraItem(objeto, cantidad, usuario) {
  const fecha = new Date().toLocaleDateString('ca-ES');
  const { rows } = await db.query(
    "INSERT INTO lista_compra (fecha, objeto, cantidad, estado, usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [fecha, objeto, cantidad, 'pendent', usuario]
  );
  
  // Registrar activitat
  await registrarActivitat(
    usuario, 
    'Llista de la compra', 
    `ha afegit: ${cantidad} de ${objeto}.`,
    `🛒 <b>Llista de la compra actualitzada</b>\n\n${usuario} ha afegit: ${cantidad} de ${objeto}.\n\n📅 ${new Date().toLocaleString('ca-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
  );
  
  return rows[0];
}

export async function toggleCompraItem(id, estadoActual, objeto, usuario) {
  const nuevoEstado = estadoActual === 'pendent' ? 'comprat' : 'pendent';
  await db.query("UPDATE lista_compra SET estado = $1 WHERE id = $2", [nuevoEstado, id]);
  
  if (nuevoEstado === 'comprat') {
    await registrarActivitat(
      usuario, 
      'Llista de la compra', 
      `ha comprat: ${objeto}.`
    );
  }
}

export async function deleteCompraItem(id, objeto, usuario) {
  try {
    await db.query("DELETE FROM lista_compra WHERE id = $1", [id]);
    
    // Registrar activitat
    if (usuario && objeto) {
      await registrarActivitat(
        usuario,
        'Llista de la compra',
        `ha eliminat: ${objeto}.`,
        `🗑️ <b>Llista de la compra</b>\n\n${usuario} ha eliminat: ${objeto}.`
      );
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}
