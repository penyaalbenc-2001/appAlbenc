import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Els Server Actions s'identifiquen amb un id que canvia en cada desplegament:
// si algu te la pagina oberta i despleguem, el seu enviament falla amb un error
// generic. Una ruta API s'adreca per URL, aixi que no depen del build del client.
export const dynamic = 'force-dynamic';

const MAX_NOM = 100;

export async function GET() {
  try {
    const currentYear = new Date().getFullYear().toString();
    const { rows } = await db.query(
      "SELECT id, fecha, tipo_comida FROM comidas WHERE dia = 'Festes' AND fecha LIKE $1 ORDER BY fecha ASC",
      [`${currentYear}%`]
    );
    return NextResponse.json({ dies: rows });
  } catch (error) {
    console.error('Festes formulari GET error:', error);
    return NextResponse.json({ error: 'No s\'han pogut carregar els dies de festes.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const nomCognoms = typeof body?.nomCognoms === 'string' ? body.nomCognoms.trim() : '';
    if (!nomCognoms) {
      return NextResponse.json({ error: 'Cal escriure el nom i cognoms.' }, { status: 400 });
    }
    if (nomCognoms.length > MAX_NOM) {
      return NextResponse.json(
        { error: `El nom no pot passar de ${MAX_NOM} caracters.` },
        { status: 400 }
      );
    }

    const esAdult = body?.esAdult === true;
    const diesSopar = Array.isArray(body?.diesSopar) ? body.diesSopar.filter(d => typeof d === 'string') : [];
    const diesCuinar = esAdult && Array.isArray(body?.diesCuinar)
      ? body.diesCuinar.filter(d => typeof d === 'string')
      : [];

    const { rows } = await db.query(
      'INSERT INTO festes_assistencia (nom_cognoms, es_adult, dies_sopar, dies_cuinar) VALUES ($1, $2, $3, $4) RETURNING id',
      [nomCognoms, esAdult, JSON.stringify(diesSopar), JSON.stringify(diesCuinar)]
    );

    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (error) {
    console.error('Festes formulari POST error:', error);
    return NextResponse.json(
      { error: 'No s\'han pogut guardar les dades. Torna a intentar-ho.' },
      { status: 500 }
    );
  }
}
