import db from '@/lib/db';
import { sendTelegramMessage } from './telegram';

export async function registrarActivitat(usuario, tipoCambio, descripcion, telegramMessage = null) {
  try {
    // Obtenir data actual formatada (ex: 'Hui, 12:35' o simplement la data local)
    const now = new Date();
    const dataHora = now.toLocaleString('ca-ES', { 
      day: 'numeric', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Inserir a la taula de canvis
    await db.query(`
      INSERT INTO cambios (fecha, tipo_cambio, descripcion, usuario)
      VALUES ($1, $2, $3, $4)
    `, [dataHora, tipoCambio, descripcion, usuario]);

    // Enviar Telegram si s'ha proporcionat un missatge
    if (telegramMessage) {
      await sendTelegramMessage(telegramMessage);
    }

    return true;
  } catch (error) {
    console.error('Error registrant activitat:', error);
    return false;
  }
}
