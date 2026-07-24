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
      margin:       10,
      filename:     `Disponibilitat_Festes.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  const formatDay = (dateStr) => {
    return dateStr.split('-')[2]; // YYYY-MM-DD -> DD
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
              <tr style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'left', minWidth: '150px' }}>Nom i Cognoms</th>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', width: '60px' }}>Tipus</th>
                {diesFestes.map((dia, idx) => (
                  <th key={dia.id || `dia-${idx}`} style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    {formatDay(dia.fecha)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {respostes.map((resp, i) => {
                const diesCuinarArr = resp.dies_cuinar || [];
                const diesSoparArr = resp.dies_sopar || [];
                
                return (
                  <tr key={resp.id} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: '500' }}>
                      {resp.nom_cognoms}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                      {resp.es_adult ? '👨🏽' : '👧🏽'}
                    </td>
                    {diesFestes.map((dia, idx) => {
                      const potCuinar = diesCuinarArr.includes(dia.fecha);
                      const veSopar = diesSoparArr.includes(dia.fecha);
                      
                      return (
                        <td 
                          key={dia.id || `td-${idx}`} 
                          style={{ 
                            padding: '10px', 
                            border: '1px solid #cbd5e1', 
                            textAlign: 'center',
                            backgroundColor: potCuinar ? '#bbf7d0' : 'transparent', // Sombreado verde si puede cocinar
                            fontWeight: potCuinar ? 'bold' : 'normal',
                            color: potCuinar ? '#166534' : 'inherit'
                          }}
                        >
                          {veSopar && !potCuinar && '🍽️'}
                          {potCuinar && '🧑‍🍳'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>🧑‍🍳 Fons verd: Disponible per a cuinar</span>
            <span>🍽️ Forquilla: Només ve a sopar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
