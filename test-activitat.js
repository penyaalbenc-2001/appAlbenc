import dotenv from 'dotenv';
dotenv.config();
import { registrarActivitat } from './src/lib/activitat.js';

async function test() {
  const result = await registrarActivitat(
    'TestUser',
    'Test',
    'Esto es una prueba del sistema de actividad',
    '🚀 <b>Prueba</b>\n\nMensaje de prueba desde test-activitat.js'
  );
  console.log('Result:', result);
  process.exit(0);
}

test();
