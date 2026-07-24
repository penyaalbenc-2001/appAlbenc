import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(fecha) {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export async function GET() {
  try {
    const currentYear = new Date().getFullYear().toString();
    const { rows: dies } = await db.query(
      "SELECT fecha, cocineros, participantes FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1 ORDER BY fecha ASC",
      [`${currentYear}%`]
    );

    if (dies.length === 0) {
      return NextResponse.json({ success: true, skipped: 'no-festes-data' });
    }

    const primerDiaFestes = toDateOnly(new Date(dies[0].fecha));
    const avui = toDateOnly(new Date());

    const diesFinsFestes = Math.round((primerDiaFestes - avui) / (1000 * 60 * 60 * 24));

    // Només enviem l'avís quan falta exactament una setmana per a Festes.
    if (diesFinsFestes !== 7) {
      return NextResponse.json({ success: true, skipped: true, diesFinsFestes });
    }

    let missatge = `🎉 <b>Falta 1 setmana per a Festes!</b>\n`;
    missatge += `Ací teniu qui cuina i qui ve a menjar cada dia:\n`;

    dies.forEach((dia) => {
      missatge += `\n📅 <b>${formatDate(dia.fecha)}</b>\n`;
      missatge += `🧑‍🍳 Cuiners: ${dia.cocineros || 'Sense assignar'}\n`;
      const comensals = dia.participantes
        ? dia.participantes.split(',').map((c) => c.trim()).filter(Boolean)
        : [];
      missatge += `🍽️ Comensals (${comensals.length}): ${comensals.length ? comensals.join(', ') : 'Cap apuntat encara'}\n`;
    });

    const enviat = await sendTelegramMessage(missatge);

    return NextResponse.json({ success: enviat, diesFinsFestes });
  } catch (err) {
    console.error('Error avis Festes:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
