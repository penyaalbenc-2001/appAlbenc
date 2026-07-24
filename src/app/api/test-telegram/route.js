import { registrarActivitat } from '@/lib/activitat';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await registrarActivitat(
    'TestUser',
    'Test',
    'Esto es una prueba del sistema de actividad desde API',
    '🚀 <b>Prueba API</b>\n\nMensaje de prueba desde la ruta API test-telegram'
  );
  return NextResponse.json({ success: result });
}
