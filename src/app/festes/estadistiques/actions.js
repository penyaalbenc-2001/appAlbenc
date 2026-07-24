'use server';

import db from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function getFestesStats() {
  // Fetch all Festes meals
  const { rows: meals } = await db.query("SELECT fecha, cocineros FROM comidas WHERE dia = 'Festes' AND cocineros IS NOT NULL AND cocineros != ''");
  
  // Fetch all valid male members to filter out partners/women (exclude Administrador)
  const { rows: membres } = await db.query("SELECT nom FROM membres WHERE nom != 'Administrador'");
  const memberNames = membres.map(m => m.nom);

  const stats = {};

  // Initialize stats for all active members
  memberNames.forEach(nom => {
    stats[nom] = { total: 0, dissabtes: 0, anys: {} };
  });

  // Diccionari per traduir els noms del 2025 a la base de dades oficial
  const aliasMap = {
    'francisco vicente': 'Xisco',
    'j. fernando marques': 'Juan Fernando',
    'j. ramon barreda': 'Juan Ramon',
    'victor prades': 'Victor M.',
    'victor zandalinas': 'Victor Z.',
    'miguel a. monfort': 'Miguel A.',
    'raul altaba': 'Raul A.'
  };

  meals.forEach(meal => {
    const isSaturday = new Date(meal.fecha).getDay() === 6;
    const year = new Date(meal.fecha).getFullYear().toString();
    
    // Split by comma and trim
    const cocineros = meal.cocineros.split(',').map(c => c.trim()).filter(Boolean);
    
    cocineros.forEach(c => {
      const lowerName = c.toLowerCase();
      let matchName = aliasMap[lowerName];
      
      let matchedMember;
      if (matchName) {
        matchedMember = memberNames.find(m => m === matchName);
      } else {
        matchedMember = memberNames.find(m => lowerName.includes(m.toLowerCase()) || m.toLowerCase().includes(lowerName));
      }
      
      if (matchedMember) {
        if (!stats[matchedMember]) {
          stats[matchedMember] = { total: 0, dissabtes: 0, anys: {} };
        }
        stats[matchedMember].total += 1;
        if (isSaturday) {
          stats[matchedMember].dissabtes += 1;
        }
        if (!stats[matchedMember].anys[year]) {
          stats[matchedMember].anys[year] = { normals: 0, dissabtes: 0 };
        }
        if (isSaturday) {
          stats[matchedMember].anys[year].dissabtes += 1;
        } else {
          stats[matchedMember].anys[year].normals += 1;
        }
      }
    });
  });

  // Convert to array and sort by total descending, then dissabtes descending
  const sortedStats = Object.entries(stats)
    .map(([nom, data]) => {
      const percentatgeDissabtes = data.total > 0 ? Math.round((data.dissabtes / data.total) * 100) : 0;
      return { 
        nom, 
        total: data.total, 
        dissabtes: data.dissabtes, 
        percentatgeDissabtes,
        anys: data.anys 
      };
    })
    .sort((a, b) => b.total - a.total || b.dissabtes - a.dissabtes);

  return sortedStats;
}
