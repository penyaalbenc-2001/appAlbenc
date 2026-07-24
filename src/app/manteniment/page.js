import db from '@/lib/db';

export const revalidate = 0;

export default async function MantenimentPage() {
  const { rows } = await db.query('SELECT * FROM mantenimiento ORDER BY id DESC');

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <h1 className="title">Manteniment</h1>
      
      <div className="card" style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>🔧 Torn Actual</h2>
        <p style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
          {rows.length > 0 ? (rows[0].mantenimiento || rows[0].cadafals) : 'No definit'}
        </p>
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Historial</h3>
      <div className="card">
        {rows.length <= 1 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hi ha més historial disponible.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {rows.slice(1).map((r, i) => (
              <li key={r.id || i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{r.año || 'Passat'}:</strong> {r.mantenimiento || r.cadafals}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
