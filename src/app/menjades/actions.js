'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getAllMembres() {
  const { rows } = await db.query('SELECT id, nom FROM membres ORDER BY nom ASC');
  return rows;
}

export async function getMenjades() {
  const { rows } = await db.query("SELECT * FROM comidas ORDER BY fecha ASC");
  return rows;
}

export async function addMenjada(fecha, hora, lugar, cocineros, informacion, usuario) {
  const { rows } = await db.query(
    "INSERT INTO comidas (fecha, hora, lugar, cocineros, informacion, estado) VALUES ($1, $2, $3, $4, $5, 'programada') RETURNING *",
    [fecha, hora, lugar, cocineros, informacion]
  );
  
  await registrarActivitat(
    usuario, 
    'Menjades', 
    `ha creat una menjada el ${fecha}.`,
    `🍽️ <b>Nova Menjada</b>\n\n${usuario} ha afegit una nova menjada.\n\n📅 Data: ${fecha}\n🕐 Hora: ${hora || '-'}\n📍 Lloc: ${lugar || '-'}\n🍳 Cuiners: ${cocineros}`
  );
  
  return rows[0];
}

export async function updateCocineros(id, nuevosCocineros, antiguosCocineros, fecha, usuario) {
  const { rows } = await db.query(
    "UPDATE comidas SET cocineros = $1 WHERE id = $2 RETURNING *",
    [nuevosCocineros, id]
  );
  
  if (rows.length > 0) {
    await registrarActivitat(
      usuario, 
      'Menjades', 
      `ha canviat els cuiners del dia ${fecha}.`,
      `🔄 <b>Canvi de Cuiners</b>\n\n${usuario} ha modificat els cuiners per al dia ${fecha}.\n\n❌ Abans: ${antiguosCocineros || 'Ningú'}\n✅ Ara: ${nuevosCocineros || 'Ningú'}`
    );
  }
  
  return rows[0];
}

export async function executeSwap(meal1Id, meal1NewCocineros, meal1Fecha, meal2Id, meal2NewCocineros, meal2Fecha, usuario, nom1, nom2) {
  // Update Meal 1
  await db.query("UPDATE comidas SET cocineros = $1 WHERE id = $2", [meal1NewCocineros, meal1Id]);
  // Update Meal 2
  await db.query("UPDATE comidas SET cocineros = $1 WHERE id = $2", [meal2NewCocineros, meal2Id]);
  
  await registrarActivitat(
    usuario, 
    'Menjades', 
    `ha intercanviat ${nom1} (del dia ${meal1Fecha}) per ${nom2} (del dia ${meal2Fecha}).`,
    `🔄 <b>Intercanvi de Cuiners</b>\n\n${usuario} ha realitzat el següent intercanvi:\n\n➡️ Dia ${meal1Fecha}: Entra ${nom2}\n⬅️ Dia ${meal2Fecha}: Entra ${nom1}\n\nAra els cuiners del dia ${meal1Fecha} són: ${meal1NewCocineros}\nAra els cuiners del dia ${meal2Fecha} són: ${meal2NewCocineros}`
  );
}

export async function executeAddRemove(mealId, newCocineros, mealFecha, usuario, accio, nomMembre) {
  await db.query("UPDATE comidas SET cocineros = $1 WHERE id = $2", [newCocineros, mealId]);
  
  const textAccio = accio === 'add' ? `ha afegit a ${nomMembre} als cuiners del dia ${mealFecha}` : `ha llevat a ${nomMembre} dels cuiners del dia ${mealFecha}`;
  const icona = accio === 'add' ? '➕' : '➖';
  
  await registrarActivitat(
    usuario, 
    'Menjades', 
    `${textAccio}.`,
    `${icona} <b>Modificació de Cuiners</b>\n\n${usuario} ${textAccio}.\n\n✅ Nova llista de cuiners: ${newCocineros || 'Cap'}`
  );
}

export async function deleteMenjada(id, usuario) {
  await db.query("DELETE FROM comidas WHERE id = $1", [id]);
  await registrarActivitat(usuario, 'Menjades', 'ha eliminat una menjada.');
}
