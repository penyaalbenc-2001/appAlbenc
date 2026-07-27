'use client';

import { useState, useEffect } from 'react';
import { getFestesStats } from './actions';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function EstadistiquesFestesPage() {
  const router = useRouter();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFestesStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Error carregant les estadístiques.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Calculant estadístiques històriques...</div>;
  if (error) return <div style={{textAlign:'center', marginTop:'50px', color: 'red'}}>{error}</div>;

  const formatName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
  };

  // Prepare chart data for ranking of Saturdays
  const chartData = [...stats]
    .sort((a, b) => b.dissabtes - a.dissabtes)
    .filter(s => s.dissabtes > 0)
    .map(s => ({
      name: formatName(s.nom),
      dissabtes: s.dissabtes
    }));

  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => router.push('/festes')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Tornar a Festes
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="title" style={{ margin: 0, fontSize: '28px' }}>📈 Rànquing de Cuiners</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
          Acumulat de Festes des del 2025. 
        </p>
        <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold', margin: 0 }}>
          * Parelles excloses automàticament de les estadístiques.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                <th style={{ padding: '15px', width: '60px', textAlign: 'center' }}>Pos</th>
                <th style={{ padding: '15px' }}>Membre</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Total Festes</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Dissabtes</th>
                <th style={{ padding: '15px', textAlign: 'center', backgroundColor: '#dc2626' }}>% Dissabtes</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, idx) => {
                // Highlight top 3
                let medal = '';
                if (idx === 0) medal = '🥇';
                else if (idx === 1) medal = '🥈';
                else if (idx === 2) medal = '🥉';
                else medal = `${idx + 1}`;

                return (
                  <tr key={s.nom} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                      {medal}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {formatName(s.nom)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px', color: 'var(--primary-green)', fontWeight: 'bold' }}>
                      {s.total}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px', color: '#475569', fontWeight: 'bold' }}>
                      {s.dissabtes}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px', color: '#dc2626', fontWeight: 'bold', backgroundColor: '#fef2f2' }}>
                      {s.percentatgeDissabtes}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rànquing Dissabtes */}
      <div className="card" style={{ padding: '25px', backgroundColor: 'white' }}>
        <h2 style={{ color: '#dc2626', margin: '0 0 20px 0', fontSize: '22px' }}>🔥 Top Cuiners en Dissabte</h2>
        
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: Math.max(300, chartData.length * 40) }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 'bold'}} width={100} />
                <Tooltip 
                  cursor={{fill: '#fef2f2'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #fca5a5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="dissabtes" name="Dissabtes Cuinats" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Ningú ha cuinat cap dissabte encara.
          </div>
        )}
      </div>

    </div>
  );
}
