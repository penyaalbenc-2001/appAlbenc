'use server';

import db from '@/lib/db';
import { registrarActivitat } from '@/lib/activitat';

export async function getEsdeveniments() {
  const { rows } = await db.query("SELECT * FROM eventos ORDER BY fecha ASC");
  return rows;
}

export async function addEsdeveniment(evento, fecha, fecha_fin, hora, ubicacion, descripcion, usuario) {
  const { rows } = await db.query(
    "INSERT INTO eventos (evento, fecha, fecha_fin, hora, ubicacion, descripcion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [evento, fecha, fecha_fin || null, hora, ubicacion, descripcion]
  );
  
  await registrarActivitat(
    usuario, 
    'Esdeveniments', 
    `ha creat l'esdeveniment "${evento}".`,
    `📅 <b>Nou Esdeveniment</b>\n\n${usuario} ha creat "${evento}".\n\n📅 ${fecha}\n🕐 ${hora || '-'}\n📍 ${ubicacion || '-'}`
  );
  
  return rows[0];
}

export async function deleteEsdeveniment(id, evento, usuario) {
  await db.query("DELETE FROM eventos WHERE id = $1", [id]);
  await registrarActivitat(
    usuario,
    'Esdeveniments',
    `ha eliminat l'esdeveniment "${evento}".`,
    `🗑️ <b>Esdeveniment eliminat</b>\n\n${usuario} ha eliminat "${evento}".`
  );
}

export async function getAllCalendarEvents() {
  // Fetch events
  const { rows: eventos } = await db.query("SELECT id, evento as title, fecha as date, fecha_fin, hora as time, ubicacion as location, descripcion as description FROM eventos");
  
  // Fetch meals
  const { rows: comidas } = await db.query("SELECT id, dia as title_fallback, tipo_comida, fecha as date, hora as time, lugar as location, informacion as description FROM comidas");
  
  const formattedEventos = [];
  eventos.forEach(e => {
    if (e.fecha_fin && new Date(e.fecha_fin) > new Date(e.date)) {
      // Multi-day event
      let curr = new Date(e.date);
      const end = new Date(e.fecha_fin);
      while (curr <= end) {
        formattedEventos.push({
          ...e,
          date: curr.toISOString().split('T')[0],
          type: 'evento'
        });
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      formattedEventos.push({
        ...e,
        type: 'evento'
      });
    }
  });

  // Generate automatic Festes for 2020-2050 based on the 15th of August rule
  for (let year = 2020; year <= 2050; year++) {
    const aug15 = new Date(Date.UTC(year, 7, 15)); // Month is 0-indexed (7 = August)
    const dayOfWeek = aug15.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    
    // Formula: if Sunday (0) subtract 9, else subtract dayOfWeek + 2
    const subtractDays = dayOfWeek === 0 ? 9 : dayOfWeek + 2;
    
    let startFestes = new Date(Date.UTC(year, 7, 15));
    startFestes.setUTCDate(aug15.getUTCDate() - subtractDays);
    
    let endFestes = new Date(startFestes);
    endFestes.setUTCDate(startFestes.getUTCDate() + 9);

    let curr = new Date(startFestes);
    while (curr <= endFestes) {
      formattedEventos.push({
        id: `festes-auto-${year}-${curr.getTime()}`,
        title: 'Festes de l\'Albenc',
        date: curr.toISOString().split('T')[0],
        time: '',
        location: 'El Poble',
        description: 'Setmana de Festes del Poble!',
        type: 'evento'
      });
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
  }

  const formattedComidas = comidas.map(c => {
    let title = c.title_fallback;
    if (!title) {
      if (c.tipo_comida === 'sopar') title = 'Sopar';
      else if (c.tipo_comida === 'dinar') title = 'Dinar';
      else title = 'Menjar';
    }
    
    return {
      id: `comida-${c.id}`,
      title: title,
      date: c.date,
      time: c.time,
      location: c.location,
      description: c.description,
      type: 'comida'
    };
  });

  // Combine and return
  return [...formattedEventos, ...formattedComidas];
}
