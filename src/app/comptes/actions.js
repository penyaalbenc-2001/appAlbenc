'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getComptes() {
  const { rows } = await db.query("SELECT * FROM comptes ORDER BY data DESC, id DESC");
  return rows;
}

export async function addCompte(concepte, importValor, tipus, data, usuari, adjunt = null) {
  let finalImport = parseFloat(importValor);
  let finalConcepte = concepte;
  let finalTipus = tipus;

  // Lògica de Derrama (x15)
  if (tipus === 'derrama') {
    finalImport = finalImport * 15;
    finalConcepte = `Derrama: ${concepte} (${importValor}€ x 15 socis)`;
    finalTipus = 'ingres'; // A nivell de saldo, una derrama és un ingrés
  }

  const { rows } = await db.query(
    "INSERT INTO comptes (concepte, import, tipus, data, membre_nom, adjunt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [finalConcepte, finalImport, finalTipus, data, usuari, adjunt]
  );
  
  const icona = finalTipus === 'ingres' ? '💰' : '💸';
  const signe = finalTipus === 'ingres' ? '+' : '-';
  
  await registrarActivitat(
    usuari, 
    'Comptes', 
    `ha registrat un ${finalTipus} de ${finalImport}€.`,
    `${icona} <b>Nou Moviment Econòmic</b>\n\n${usuari} ha afegit un ${finalTipus}.\n\n📋 ${finalConcepte}\n💶 ${signe}${finalImport}€\n📅 ${data}`
  );
  
  return rows[0];
}

export async function deleteCompte(id, concepte, usuari) {
  await db.query("DELETE FROM comptes WHERE id = $1", [id]);
  await registrarActivitat(
    usuari,
    'Comptes',
    `ha eliminat l'apunt "${concepte}".`,
    `🗑️ <b>Apunt eliminat</b>\n\n${usuari} ha eliminat l'apunt "${concepte}".`
  );
}
