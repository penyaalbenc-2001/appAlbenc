import db from '@/lib/db';

export const revalidate = 0;

export default async function NoticiesPage() {
  const { rows } = await db.query('SELECT * FROM noticias ORDER BY fecha_scraping DESC NULLS LAST, id DESC');

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <h1 className="title">Notícies</h1>
      
      {rows.length === 0 ? (
        <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hi ha notícies disponibles.</p></div>
      ) : (
        rows.map((n, i) => (
          <div key={n.id || `noticia-${i}`} className="card">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '5px' }}>{n.titulo}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {n.origen} • {n.fecha_scraping ? new Date(n.fecha_scraping).toLocaleDateString('ca-ES') : ''}
            </p>
            {n.imagen && (
              <img src={n.imagen} alt={n.titulo} style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '10px' }} />
            )}
            <p style={{ lineHeight: '1.5', color: 'var(--text-main)' }}>{n.resumen}</p>
            {n.link && (
              <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '15px', color: 'white', background: 'var(--primary-blue)', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold' }}>
                Llegir article complet
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}
