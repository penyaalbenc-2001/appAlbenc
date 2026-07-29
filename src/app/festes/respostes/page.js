'use client';

import { useState, useEffect } from 'react';
import { getDiesFestes } from '../formulari/actions';
import { getRespostes } from './actions';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RespostesFestesPage() {
  const router = useRouter();
  const [diesFestes, setDiesFestes] = useState([]);
  const [respostes, setRespostes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Check auth (only logged in users can see this)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const dies = await getDiesFestes();
      const resp = await getRespostes();
      
      setDiesFestes(dies);
      setRespostes(resp);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.getElementById('taula-respostes');
    
    const opt = {
      margin:       5, // mm
      filename:     `Disponibilitat_Festes.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        windowWidth: Math.max(element.scrollWidth, 1024), 
        width: Math.max(element.scrollWidth, 1024) 
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    // Temporarily remove overflow to ensure full capture if screen is small
    const parent = element.parentElement;
    const originalOverflow = parent.style.overflowX;
    parent.style.overflowX = 'visible';
    
    await html2pdf().from(element).set(opt).save();
    
    parent.style.overflowX = originalOverflow;
  };

  const formatDay = (dateStr) => {
    return dateStr.split('-')[2]; // YYYY-MM-DD -> DD
  };

  const formatName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Carregant resultats...</div>;

  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => router.push('/festes')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Tornar a Festes
        </button>
        <button onClick={handleExportPDF} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📄 Exportar PDF
        </button>
      </div>

      <h1 className="title">📊 Resultats Disponibilitat Festes</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Ombrejat verd: <strong>Disponible per a cuinar</strong>. 🍽️: Ve a sopar.
      </p>

      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div id="taula-respostes" style={{ padding: '20px' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary-orange)', marginBottom: '20px' }}>Disponibilitat Penya Albenc</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-blue)', color: 'white', fontSize: '12px' }}>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'left', whiteSpace: 'nowrap' }}>Nom i Cognoms</th>
                <th style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Tipus</th>
                {diesFestes.map((dia, idx) => (
                  <th key={dia.id || `dia-${idx}`} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    {formatDay(dia.fecha)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {respostes.map((resp, i) => {
                const diesCuinarArr = typeof resp.dies_cuinar === 'string' ? JSON.parse(resp.dies_cuinar) : (resp.dies_cuinar || []);
                const diesSoparArr = typeof resp.dies_sopar === 'string' ? JSON.parse(resp.dies_sopar) : (resp.dies_sopar || []);
                
                return (
                  <tr key={resp.id} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : 'white', fontSize: '12px' }}>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {formatName(resp.nom_cognoms)}
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '14px' }}>
                      <span title={resp.es_adult ? 'Adult' : 'Xiquet'}>{resp.es_adult ? '👨🏽' : '👧🏽'}</span>
                    </td>
                    {diesFestes.map((dia, idx) => {
                      const potCuinar = diesCuinarArr.includes(dia.fecha);
                      const veSopar = diesSoparArr.includes(dia.fecha);
                      
                      return (
                        <td 
                          key={dia.id || `td-${idx}`} 
                          style={{ 
                            padding: '4px', 
                            border: '1px solid #cbd5e1', 
                            textAlign: 'center',
                            backgroundColor: potCuinar ? '#bbf7d0' : (veSopar ? '#f1f5f9' : 'transparent'),
                            fontWeight: potCuinar ? 'bold' : 'normal',
                            color: potCuinar ? '#166534' : 'inherit'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', fontSize: '14px' }}>
                            {veSopar && <span title="Ve a sopar">🍽️</span>}
                            {potCuinar && <span title="S'ofereix per a cuinar">🧑‍🍳</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', fontSize: '12px' }}>
                <td colSpan="2" style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Total Sopars:</td>
                {diesFestes.map((dia, idx) => {
                  const comensals = respostes.filter(r => {
                    const s = typeof r.dies_sopar === 'string' ? JSON.parse(r.dies_sopar) : (r.dies_sopar || []);
                    return s.includes(dia.fecha);
                  });
                  const totalSopars = comensals.length;
                  const adultsCount = comensals.filter(r => r.es_adult).length;
                  const xiquetsCount = comensals.filter(r => !r.es_adult).length;
                  
                  return (
                    <td key={`tot-sopar-${idx}`} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center', color: 'var(--primary-blue-dark)' }}>
                      <div>{totalSopars}</div>
                      {totalSopars > 0 && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap' }}>
                          👨🏽{adultsCount} 👧🏽{xiquetsCount}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 'bold', fontSize: '12px' }}>
                <td colSpan="2" style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Voluntaris Cuina:</td>
                {diesFestes.map((dia, idx) => {
                  const totalCuiners = respostes.filter(r => {
                    const c = typeof r.dies_cuinar === 'string' ? JSON.parse(r.dies_cuinar) : (r.dies_cuinar || []);
                    return c.includes(dia.fecha);
                  }).length;
                  return <td key={`tot-cuina-${idx}`} style={{ padding: '4px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#166534' }}>{totalCuiners}</td>;
                })}
              </tr>
            </tfoot>
          </table>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>🧑‍🍳 Fons verd: Disponible per a cuinar</span>
            <span>🍽️ Forquilla: Només ve a sopar</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>👤 Vista Individual</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Fes clic sobre una persona per veure els seus resultats al detall.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {respostes.map(resp => {
            const diesCuinarArr = typeof resp.dies_cuinar === 'string' ? JSON.parse(resp.dies_cuinar) : (resp.dies_cuinar || []);
            const diesSoparArr = typeof resp.dies_sopar === 'string' ? JSON.parse(resp.dies_sopar) : (resp.dies_sopar || []);
            
            return (
              <details key={`det-${resp.id}`} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <summary style={{ fontWeight: 'bold', cursor: 'pointer', outline: 'none', padding: '5px' }}>
                  {formatName(resp.nom_cognoms)} {resp.es_adult ? '👨🏽' : '👧🏽'}
                </summary>
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
                  <p style={{ marginBottom: '8px' }}><strong>🍽️ Dies que sopa ({diesSoparArr.length}):</strong></p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '15px', margin: 0, color: '#334155' }}>
                    {diesSoparArr.length > 0 ? diesSoparArr.map(d => <li key={`sop-${d}`}>{d}</li>) : <li>Cap dia</li>}
                  </ul>
                  
                  {resp.es_adult && (
                    <>
                      <p style={{ marginBottom: '8px' }}><strong>🧑‍🍳 S'ofereix per cuinar ({diesCuinarArr.length}):</strong></p>
                      <ul style={{ paddingLeft: '20px', margin: 0, color: '#166534' }}>
                        {diesCuinarArr.length > 0 ? diesCuinarArr.map(d => <li key={`cui-${d}`}>{d}</li>) : <li>Cap dia</li>}
                      </ul>
                    </>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
