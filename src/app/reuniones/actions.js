'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getReuniones() {
  const { rows } = await db.query('SELECT * FROM reuniones ORDER BY fecha DESC');
  return rows;
}

export async function saveReunion(id, fecha, temas, asistentes, estado, usuario) {
  if (id) {
    const { rows } = await db.query(
      'UPDATE reuniones SET fecha = $1, temas = $2, asistentes = $3, estado = $4 WHERE id = $5 RETURNING *',
      [fecha, temas, asistentes, estado, id]
    );
    await registrarActivitat(
      usuario,
      'Reuniones',
      `ha modificat l'acta de la reunió del dia ${fecha}`,
      `📝 <b>Acta de Reunió modificada</b>\n\n${usuario} ha modificat l'acta de la reunió del dia ${fecha}.`
    );
    return rows[0];
  } else {
    const { rows } = await db.query(
      'INSERT INTO reuniones (fecha, temas, asistentes, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [fecha, temas, asistentes, estado]
    );
    await registrarActivitat(
      usuario, 
      'Reuniones', 
      `ha creat una nova acta de reunió per al dia ${fecha}`,
      `📝 <b>Nova Acta de Reunió</b>\n\n${usuario} ha creat l'acta de la reunió del dia ${fecha}.\n\n👥 Assistents: ${asistentes || 'Cap'}\n\n Pots llegir l'acta completa i exportar-la a PDF des de l'App de la Penya.`
    );
    return rows[0];
  }
}

export async function deleteReunion(id, usuario) {
  await db.query('DELETE FROM reuniones WHERE id = $1', [id]);
  await registrarActivitat(
    usuario,
    'Reuniones',
    'ha eliminat una acta de reunió',
    `🗑️ <b>Acta de Reunió eliminada</b>\n\n${usuario} ha eliminat una acta de reunió.`
  );
}
