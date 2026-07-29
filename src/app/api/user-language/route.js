import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const { rows } = await db.query('SELECT idioma FROM membres WHERE usuari_id_auth = $1', [userId]);
    if (rows.length > 0) {
      return NextResponse.json({ idioma: rows[0].idioma });
    }
    return NextResponse.json({ idioma: null });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId, idioma } = await req.json();
    if (!userId || !idioma) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    await db.query('UPDATE membres SET idioma = $1 WHERE usuari_id_auth = $2', [idioma, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
