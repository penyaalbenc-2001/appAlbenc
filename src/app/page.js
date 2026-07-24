import db from '@/lib/db';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const revalidate = 0; // Disable caching

async function getDashboardData() {
  const data = {
    membreNom: 'Amic',
    menjada: null,
    esdeveniment: null,
    manteniment: null,
    noticies: [],
    activitat: [],
    compra: []
  };

  try {
    // Obtenir Usuari Auth
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
      },
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Si no hi ha usuari, no hauria de vore res, forcem que inicie sessió.
      return { redirect: true };
    }
    
    const { rows } = await db.query('SELECT nom FROM membres WHERE usuari_id_auth = $1', [user.id]);
    if (rows.length > 0) data.membreNom = rows[0].nom;

    // A & B: Pròxims Esdeveniments i Menjades combinats (6)
    const { rows: menjades } = await db.query("SELECT * FROM comidas WHERE fecha >= CURRENT_DATE::text ORDER BY fecha ASC LIMIT 6");
    const { rows: esdeveniments } = await db.query("SELECT * FROM eventos WHERE fecha >= CURRENT_DATE::text ORDER BY fecha ASC LIMIT 6");
    
    let unified = [
      ...menjades.map(m => ({ ...m, _type: 'comida' })),
      ...esdeveniments.map(e => ({ ...e, _type: 'evento' }))
    ];

    if (unified.length === 0) {
      // Fallback
      const { rows: fallbackMenjades } = await db.query("SELECT * FROM comidas ORDER BY id DESC LIMIT 6");
      const { rows: fallbackEventos } = await db.query("SELECT * FROM eventos ORDER BY id DESC LIMIT 6");
      unified = [
        ...fallbackMenjades.map(m => ({ ...m, _type: 'comida' })),
        ...fallbackEventos.map(e => ({ ...e, _type: 'evento' }))
      ];
    }

    unified.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });

    data.proxims = unified.slice(0, 6);

    // C. Manteniment
    const currentYear = new Date().getFullYear().toString();
    const { rows: manteniment } = await db.query('SELECT * FROM mantenimiento WHERE "año" = $1 LIMIT 1', [currentYear]);
    if (manteniment.length > 0) data.manteniment = manteniment[0];

    // D. Notícies
    const { rows: noticies } = await db.query('SELECT * FROM noticias ORDER BY fecha_scraping DESC NULLS LAST, id DESC LIMIT 6');
    data.noticies = noticies;

    // E. Activitat recent
    const { rows: activitat } = await db.query("SELECT * FROM cambios WHERE usuario != 'Anónimo' ORDER BY id DESC LIMIT 5");
    data.activitat = activitat;

    // F. Llista de la compra pendent
    const { rows: compra } = await db.query("SELECT * FROM lista_compra WHERE estado = 'pendent' ORDER BY id DESC LIMIT 5");
    data.compra = compra;

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  return data;
}

export const dynamic = 'force-dynamic';

function highlightName(text, nameToHighlight) {
  if (!text || !nameToHighlight) return text;
  const parts = text.split(new RegExp(`(${nameToHighlight})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === nameToHighlight.toLowerCase() 
      ? <span key={i} style={{ color: 'var(--primary-blue-dark)', fontWeight: '900', backgroundColor: '#e0f2fe', padding: '0 4px', borderRadius: '4px', textDecoration: 'underline' }}>{part}</span> 
      : part
  );
}

import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const data = await getDashboardData();
  
  if (data.redirect) {
    redirect('/login');
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      {/* Capçalera */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(4,120,87,0.75), rgba(3,105,161,0.75)), url("/fondo.jpg") no-repeat center center / cover',
        backgroundColor: 'var(--primary-green-dark)', /* Color de seguretat per si la imatge no carrega */
        padding: '30px 20px 40px',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
        marginBottom: '30px',
        boxShadow: 'var(--shadow-lg)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <img 
            src="/icon.jpeg" 
            alt="Logo Penya l'Albenc" 
            style={{ 
              height: '150px', 
              width: 'auto', 
              borderRadius: '24px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
            }} 
          />
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '1px', margin: 0, textShadow: '1px 1px 3px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            PENYA L'ALBENC
          </h1>
        </div>
        <h2 style={{ fontSize: '1.2rem', textAlign: 'center', marginTop: '15px', fontWeight: '600', opacity: 0.9 }}>
          Hola, {data.membreNom}! 👋
        </h2>
      </header>
      
      <div className="container">
      
      {/* 0. Manteniment i Cadafals */}
      <section style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '8px' }}>Manteniment i Cadafals</h3>
        {!data.manteniment ? (
          <div className="card"><p style={{ color: 'var(--text-muted)' }}>🛠️ No hi ha torns per a enguany ({new Date().getFullYear()}).</p></div>
        ) : (
          <Link href="/manteniment" className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center', borderLeft: '4px solid var(--primary-orange)', textDecoration: 'none', padding: '10px 15px', borderRadius: '8px' }}>
            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '70px' }}>
              {data.manteniment.año === '2026' ? (
                <>
                  <span style={{ display: 'block', fontSize: '2rem', fontWeight: '900', color: 'var(--primary-orange)', lineHeight: '1' }}>2026</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary-orange)', marginTop: '5px' }}>25 ANIVERSARI</span>
                </>
              ) : (
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: '900', color: 'var(--primary-orange)', lineHeight: '1' }}>{data.manteniment.año}</span>
              )}
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '1.1rem' }}>🧹</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <strong>Manteniment:</strong> {highlightName(data.manteniment.mantenimiento, data.membreNom)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{ fontSize: '1.1rem' }}>🐂</span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <strong>Cadafals:</strong> {highlightName(data.manteniment.cadafals, data.membreNom)}
                </span>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* 1 i 2. Pròximament (Agenda i Menjades) */}
      <section style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '8px' }}>Pròximament a la Penya</h3>
        {(!data.proxims || data.proxims.length === 0) ? (
          <div className="card"><p style={{ color: 'var(--text-muted)' }}>No hi ha res programat pròximament.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {data.proxims.map((item, i) => {
              // Format de data DD-MM-YYYY
              let formattedDate = item.fecha || 'Sense data';
              if (item.fecha && item.fecha.includes('-')) {
                const parts = item.fecha.split('-');
                if (parts.length === 3) {
                  formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // Més modern amb barres
                }
              }

              // Format del dia
              let formattedDia = '';
              if (item.dia) {
                formattedDia = item.dia.replace(/_/g, ' ').toUpperCase();
              }

              if (item._type === 'comida') {
                let displayTipo = item.tipo_comida || 'Menjada';
                displayTipo = displayTipo
                  .replace(/comida/gi, 'Menjar')
                  .replace(/cena/gi, 'Sopar')
                  .replace(/ y /gi, ' i ');

                return (
                  <Link key={`comida-${item.id || i}`} href="/menjades" className="card" style={{ display: 'block', borderLeft: '4px solid var(--primary-green)', textDecoration: 'none', padding: '6px 10px', borderRadius: '8px', marginBottom: '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        🍽️ 
                        {formattedDia && <span style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '1.05rem' }}>{formattedDia}</span>}
                        <span style={{ color: 'var(--primary-green)', fontSize: '0.9rem' }}>{formattedDate}</span>
                      </strong>
                      <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>{displayTipo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', marginTop: '2px' }}>
                      <strong>🍳 Cuiners:</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{highlightName(item.cocineros || 'No assignats', data.membreNom)}</span>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <Link key={`evento-${item.id || i}`} href="/agenda" className="card" style={{ display: 'block', borderLeft: '4px solid var(--primary-blue)', textDecoration: 'none', padding: '6px 10px', borderRadius: '8px', marginBottom: '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>📅 {item.evento}</h4>
                      {item.hora && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>a les {item.hora}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '2px' }}>
                      {formattedDia && <strong style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '1.05rem' }}>{formattedDia}</strong>}
                      <span style={{ color: 'var(--primary-blue-dark)', fontSize: '0.9rem', fontWeight: 'bold' }}>{formattedDate}</span>
                    </div>
                  </Link>
                );
              }
            })}
          </div>
        )}
      </section>


      {/* 4. Notícies */}
      <section style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>Últimes Notícies</h3>
          <Link href="/noticies" style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: '600' }}>Vore totes</Link>
        </div>
        {data.noticies.length === 0 ? (
          <div className="card"><p style={{ color: 'var(--text-muted)' }}>No hi ha notícies hui.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {data.noticies.map((n, i) => (
              <a key={n.id || i} href={n.link} target="_blank" rel="noopener noreferrer" className="card" style={{ padding: '0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                <div style={{ width: '100%', height: '110px', backgroundColor: '#e2e8f0', backgroundImage: `url(${n.imagen || '/assets/logo.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '0.85rem', margin: '0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3', fontWeight: '600' }}>{n.titulo}</h4>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 5 & 6. Activitat Recent i Llista de la compra */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>🕐 Últims canvis</h3>
          </div>
          <div className="card" style={{ padding: '15px', height: '100%', marginBottom: 0 }}>
            {data.activitat.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hi ha activitat recent.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.activitat.map((a, i) => (
                  <li key={a.id || i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.9rem' }}><strong>{a.usuario || 'Algú'}</strong> {a.descripcion}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.fecha}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>🛒 Llista de la compra</h3>
            <Link href="/compra" style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: '600' }}>Vore llista completa</Link>
          </div>
          <div className="card" style={{ padding: '15px', height: '100%', marginBottom: 0 }}>
            {data.compra.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No hi ha res pendent de comprar.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.compra.map((c, i) => (
                  <li key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ width: '20px', height: '20px', border: '2px solid var(--primary-orange)', borderRadius: '4px', display: 'inline-block', flexShrink: 0 }}></span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', flex: 1 }}>{c.objeto}</span>
                    <span className="badge badge-orange">{c.cantidad}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* 6. Accessos Ràpids */}
      <section style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Link href="/menjades/editor" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}>
          🍽️ Gestió de Menjars i Cuiners
        </Link>
        <Link href="/reuniones" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: 'var(--primary-orange)', borderColor: 'var(--primary-orange)' }}>
          🤝 Actes i Reunions
        </Link>
        <Link href="/compra" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          🛒 Obrir Llista de la Compra
        </Link>
      </section>

      </div>
    </div>
  );
}
