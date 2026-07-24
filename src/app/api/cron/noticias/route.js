import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import db from '@/lib/db';

export const maxDuration = 300; // Allow Vercel to run up to 5 minutes
export const dynamic = 'force-dynamic'; // Ensure it runs dynamically

const DIADIA_KEYWORDS = [
  "festa", "fiesta", "festes", "tardeo", "toros", "bous",
  "orquesta", "discomobil", "discomovil", "fira", "feria", "patron",
  "sant antoni", "sopar", "dinar", "actes", "entrades", 
  "vacances", "agenda", "cultural", "nadal", "navidad", "tardeo", "kintos", "quintos", "sant", "tributo", "fiestas"
];

const MUSICA_KEYWORDS = [
  "concierto", "musica", "música", "jazz", "band", "festival", "recital", "sonora", "tributo", "big band", "orquesta"
];

async function scrapearDiadia() {
  const url = "https://diadia.cat/";
  const noticias = [];
  const seenLinks = new Set();
  const seenTitles = new Set();

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const regexStr = `\\b(?:${DIADIA_KEYWORDS.join('|')})\\b`;
    const patronRegex = new RegExp(regexStr, 'i');

    const articulos = $('div[class*="td_module_"], div[class*="td-block-span"]');

    articulos.each((_, art) => {
      try {
        const tituloTag = $(art).find('h3.entry-title');
        if (!tituloTag.length) return;
        
        const linkTag = tituloTag.find('a');
        if (!linkTag.length) return;

        let titulo = linkTag.attr('title')?.trim() || linkTag.text().trim();
        const rawLink = linkTag.attr('href') || '';
        const linkLimpio = rawLink.split('?')[0];

        if (!linkLimpio || seenLinks.has(linkLimpio) || seenTitles.has(titulo)) return;

        const excerptTag = $(art).find('div.td-excerpt');
        const resumen = excerptTag.length ? excerptTag.text().trim() : "";

        const textoCompleto = `${titulo} ${resumen}`;
        if (!patronRegex.test(textoCompleto)) return;

        seenLinks.add(linkLimpio);
        seenTitles.add(titulo);

        let imagen = "";
        const thumbTag = $(art).find('span.entry-thumb');
        
        if (thumbTag.length) {
          imagen = thumbTag.attr('data-img-url') || '';
          if (!imagen) {
            const style = thumbTag.attr('style') || '';
            const match = style.match(/url\("?'?([^"']+)"?'?\)/);
            if (match) imagen = match[1];
          }
        }
        
        if (!imagen) {
          const imgTag = $(art).find('img');
          imagen = imgTag.attr('src') || imgTag.attr('data-src') || "";
        }

        if (!imagen) imagen = "/assets/logo.png";
        if (imagen.includes('-696x')) {
          imagen = imagen.replace(/-\d+x\d+(?=\.\w+$)/, '');
        }

        noticias.push({
          titulo, link: linkLimpio, imagen, resumen, origen: 'DiaDia',
          fecha_evento: null, lugar: null, precio: null, tipo: 'noticia'
        });
      } catch (e) {
        // Ignorar errors de l'element individual
      }
    });
  } catch (e) {
    console.error("Error Diadia:", e);
  }
  return noticias;
}

async function scrapearViveCastellon() {
  const eventos = [];
  const paginas = ["", "2/"];
  
  for (const p of paginas) {
    const url = `https://www.vivecastellon.com/eventos-castellon-agenda/${p}`;
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!response.ok) continue;
      
      const html = await response.text();
      const $ = cheerio.load(html);

      $('div.agenda1').each((_, art) => {
        try {
          const catTag = $(art).find('span.url_cate');
          const categoria = catTag.length ? catTag.text().trim().toLowerCase() : "";
          
          const tituloTag = $(art).find('h2');
          if (!tituloTag.length) return;
          const titulo = tituloTag.text().trim();
          
          const textoCompleto = `${categoria} ${titulo}`.toLowerCase();
          const hasMusic = MUSICA_KEYWORDS.some(k => textoCompleto.includes(k));
          if (!hasMusic) return;

          const h1Tag = $(art).find('h1');
          let fechaLimpia = h1Tag.length ? h1Tag.text().trim().split('—')[0].trim() : "";
          fechaLimpia = fechaLimpia.replace(/ - /g, '-').replace(/-/g, ' - ');

          const pTag = $(art).find('p');
          const pText = pTag.length ? pTag.text().trim() : "Castelló";
          const lugarParts = pText.split('−');
          const lugar = lugarParts[lugarParts.length - 1].trim();

          const aLink = tituloTag.find('a');
          let link = aLink.length ? aLink.attr('href') : url;
          if (link.startsWith('/')) link = "https://www.vivecastellon.com" + link;

          eventos.push({
            titulo, link, imagen: "/assets/logo.png", resumen: "",
            fecha_evento: fechaLimpia, lugar, precio: "Ver Web",
            tipo: 'concierto', origen: 'ViveCastellón'
          });
        } catch (e) {}
      });
    } catch (e) {
      console.error("Error ViveCastellón:", e);
    }
  }
  return eventos;
}

async function scrapearNMPNU() {
  const eventos = [];
  const url = "https://www.nomepierdoniuna.net/agenda/";
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) return eventos;
    
    const html = await response.text();
    const $ = cheerio.load(html);

    $('tr').each((_, row) => {
      const tds = $(row).find('td');
      if (tds.length >= 5) {
        try {
          const linkTag = $(tds[4]).find('a');
          if (!linkTag.length) return;
          
          const fechaRaw = $(tds[0]).text().trim();
          const f_nmpnu = fechaRaw.replace(/ - /g, '-').replace(/-/g, ' - ');

          eventos.push({
            fecha_evento: f_nmpnu,
            titulo: linkTag.text().trim(),
            lugar: `${$(tds[1]).text().trim()}, ${$(tds[2]).text().trim()}`,
            precio: $(tds[5]).text().trim() || null,
            link: linkTag.attr('href') || "",
            imagen: "/assets/logo.png",
            resumen: "",
            tipo: 'agenda',
            origen: 'NMPNU'
          });
        } catch (e) {}
      }
    });
  } catch (e) {
    console.error("Error NMPNU:", e);
  }
  return eventos;
}

export async function GET(request) {
  try {
    // 1. Scraping
    const [noticiasDiadia, eventosVC, eventosNMPNU] = await Promise.all([
      scrapearDiadia(),
      scrapearViveCastellon(),
      scrapearNMPNU()
    ]);

    const todosResultados = [...noticiasDiadia, ...eventosVC, ...eventosNMPNU];

    // 2. Insertar a la base de dades
    let inserted = 0;
    for (const item of todosResultados) {
      try {
        await db.query(
          `INSERT INTO noticias 
          (titulo, link, imagen, resumen, origen, fecha_evento, lugar, precio, tipo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (link) DO NOTHING`,
          [
            item.titulo, item.link, item.imagen, item.resumen, 
            item.origen, item.fecha_evento, item.lugar, item.precio, item.tipo
          ]
        );
        inserted++;
      } catch (err) {
        console.error("Error inserting:", err);
      }
    }

    return NextResponse.json({
      success: true,
      total_scraped: todosResultados.length,
      new_inserted: inserted
    });
    
  } catch (err) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
