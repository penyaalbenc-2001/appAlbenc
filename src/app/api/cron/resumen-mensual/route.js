import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function formatDate(fecha) {
  if (!fecha || !fecha.includes('-')) return fecha || 'Sense data';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export async function GET() {
  try {
    const { rows: menjades } = await db.query(
      "SELECT * FROM comidas WHERE fecha >= CURRENT_DATE::text ORDER BY fecha ASC LIMIT 10"
    );
    const { rows: esdeveniments } = await db.query(
      "SELECT * FROM eventos WHERE fecha >= CURRENT_DATE::text ORDER BY fecha ASC LIMIT 10"
    );

    const currentYear = new Date().getFullYear().toString();
    const { rows: manteniment } = await db.query(
      'SELECT * FROM mantenimiento WHERE "año" = $1 LIMIT 1',
      [currentYear]
    );

    const { rows: noticies } = await db.query(
      'SELECT titulo, link FROM noticias ORDER BY fecha_scraping DESC NULLS LAST, id DESC LIMIT 5'
    );

    const ara = new Date();
    const mesNom = ara.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' });

    let missatge = `📅 <b>Resum mensual — ${mesNom}</b>\n`;
    missatge += `Un cop de vista al que ve a la Penya l'Albenc:\n`;

    missatge += `\n🍽️ <b>Pròximes menjades</b>\n`;
    if (menjades.length === 0) {
      missatge += `Sense menjades programades.\n`;
    } else {
      menjades.forEach((m) => {
        missatge += `• ${formatDate(m.fecha)}${m.hora ? ' ' + m.hora : ''} — ${m.lugar || 'Sense lloc'}${m.cocineros ? ` (Cuiners: ${m.cocineros})` : ''}\n`;
      });
    }

    missatge += `\n📌 <b>Pròxims esdeveniments</b>\n`;
    if (esdeveniments.length === 0) {
      missatge += `Sense esdeveniments programats.\n`;
    } else {
      esdeveniments.forEach((e) => {
        missatge += `• ${formatDate(e.fecha)} — ${e.evento || 'Esdeveniment'}\n`;
      });
    }

    if (manteniment.length > 0) {
      missatge += `\n🧹 <b>Manteniment i Cadafals (${manteniment[0].año})</b>\n`;
      missatge += `• Manteniment: ${manteniment[0].mantenimiento || '-'}\n`;
      missatge += `• Cadafals: ${manteniment[0].cadafals || '-'}\n`;
    }

    if (noticies.length > 0) {
      missatge += `\n📰 <b>Últimes notícies</b>\n`;
      noticies.forEach((n) => {
        missatge += `• ${n.titulo}\n`;
      });
    }

    const enviat = await sendTelegramMessage(missatge);

    return NextResponse.json({ success: enviat });
  } catch (err) {
    console.error('Error resum mensual:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
