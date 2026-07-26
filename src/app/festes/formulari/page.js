'use client';

import { useState, useEffect } from 'react';
import { getDiesFestes, submitFormulari } from './actions';

export default function FestesFormulariPage() {
  const [diesFestes, setDiesFestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [nomCognoms, setNomCognoms] = useState('');
  const [esAdult, setEsAdult] = useState(true);
  const [diesSopar, setDiesSopar] = useState([]);
  const [diesCuinar, setDiesCuinar] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getDiesFestes();
      setDiesFestes(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleSopar = (fecha) => {
    if (diesSopar.includes(fecha)) {
      setDiesSopar(diesSopar.filter(f => f !== fecha));
      // Si lleva sopar, llevar tb cuinar per seguretat
      setDiesCuinar(diesCuinar.filter(f => f !== fecha));
    } else {
      setDiesSopar([...diesSopar, fecha]);
    }
  };

  const handleToggleCuinar = (fecha) => {
    if (diesCuinar.includes(fecha)) {
      setDiesCuinar(diesCuinar.filter(f => f !== fecha));
    } else {
      setDiesCuinar([...diesCuinar, fecha]);
      // Si cuina, segur que sopa
      if (!diesSopar.includes(fecha)) {
        setDiesSopar([...diesSopar, fecha]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomCognoms.trim()) {
      alert('Per favor, escriu el teu nom i cognoms.');
      return;
    }
    setSubmitting(true);
    try {
      await submitFormulari({
        nomCognoms,
        esAdult,
        diesSopar,
        diesCuinar: esAdult ? diesCuinar : []
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error en enviar les dades. Torna a intentar-ho.');
    } finally {
      setSubmitting(false);
    }
  };

  const dayOfWeek = (dateStr) => {
    const d = new Date(dateStr);
    const dies = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return dies[d.getDay()];
  };
  
  const formatDay = (dateStr) => {
    return dateStr.split('-')[2]; // YYYY-MM-DD -> DD
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', textAlign: 'center', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '2px solid #22c55e' }}>
        <h1 style={{ color: '#166534', marginBottom: '20px' }}>✅ Registre Completat!</h1>
        <p style={{ fontSize: '18px', color: '#15803d' }}>
          Gràcies, {nomCognoms}. Hem guardat les teues respostes correctament.
        </p>
        <p style={{ marginTop: '20px' }}>
          Pots tancar aquesta finestra.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', background: 'var(--primary-orange)', padding: '20px', borderRadius: '12px', color: 'black' }}>
        <img src="/icon.jpeg" alt="Penya Albenc" style={{ width: '240px', height: '120px', objectFit: 'contain', marginBottom: '15px' }} />
        <h1 style={{ margin: 0, fontSize: '24px' }}>🍽️ Organització Festes</h1>
        <p style={{ marginTop: '10px', fontSize: '15px', opacity: 0.9 }}>Reompli aquest formulari per indicar quins dies soparàs a la Penya i quins dies pots ajudar a cuinar.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregant dies de festes...</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* IDENTIFICACIÓ */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', color: 'black', marginBottom: '15px' }}>1. Les teues dades</h2>
            
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'black' }}>Nom i Cognoms:</label>
            <input 
              type="text" 
              value={nomCognoms} 
              onChange={e => setNomCognoms(e.target.value)} 
              placeholder="Ex: Joan Garcia Perez"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', marginBottom: '15px' }}
              required
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'black' }}>Tipus de persona:</label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ flex: 1, padding: '15px', border: esAdult ? '2px solid var(--primary-orange)' : '1px solid #cbd5e1', background: esAdult ? '#fff7ed' : 'white', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                <input type="radio" checked={esAdult} onChange={() => setEsAdult(true)} style={{ display: 'none' }} />
                👨🏽 Adult
              </label>
              <label style={{ flex: 1, padding: '15px', border: !esAdult ? '2px solid var(--primary-green)' : '1px solid #cbd5e1', background: !esAdult ? '#f0fdf4' : 'white', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
                <input type="radio" checked={!esAdult} onChange={() => setEsAdult(false)} style={{ display: 'none' }} />
                👧🏽 Xiquet/a
              </label>
            </div>
            {!esAdult && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>* Els xiquets només poden marcar assistència als sopars, no com a cuiners.</p>}
          </div>

          {/* DIES */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', color: 'black', marginBottom: '5px' }}>2. Disponibilitat</h2>
            <p style={{ fontSize: '14px', color: 'black', marginBottom: '20px' }}>Marca els dies que vindràs a sopar. {esAdult && "Després, indica quin/s dia/es pots cuinar."}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {diesFestes.map((dia, idx) => {
                const isSopar = diesSopar.includes(dia.fecha);
                const isCuinar = diesCuinar.includes(dia.fecha);
                
                return (
                  <div key={dia.id || `dia-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: isSopar ? '#f8fafc' : 'white' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', color: 'black' }}>
                        {dayOfWeek(dia.fecha)} {formatDay(dia.fecha)}
                        {dia.fecha === '2026-08-10' && ' (Dia de les Penyes)'}
                      </strong>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                        <span style={{ fontSize: '12px', marginBottom: '4px', color: isSopar ? '#0f172a' : '#94a3b8' }}>🍽️ Vaig a sopar</span>
                        <input 
                          type="checkbox" 
                          checked={isSopar}
                          onChange={() => handleToggleSopar(dia.fecha)}
                          style={{ width: '22px', height: '22px', accentColor: 'var(--primary-blue)' }}
                        />
                      </label>
                      
                      {esAdult && dia.fecha !== '2026-08-10' && (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                          <span style={{ fontSize: '12px', marginBottom: '4px', color: isCuinar ? '#16a34a' : '#94a3b8' }}>🧑‍🍳 Puc cuinar</span>
                          <input 
                            type="checkbox" 
                            checked={isCuinar}
                            onChange={() => handleToggleCuinar(dia.fecha)}
                            style={{ width: '22px', height: '22px', accentColor: 'var(--primary-green)' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
               <button type="button" onClick={() => setDiesSopar(diesFestes.map(d=>d.fecha))} style={{ fontSize:'13px', padding:'6px 12px', background:'#e0f2fe', color:'#0369a1', border:'none', borderRadius:'4px', cursor:'pointer' }}>Marcar tots Sopar</button>
               <button type="button" onClick={() => { setDiesSopar([]); setDiesCuinar([]); }} style={{ fontSize:'13px', padding:'6px 12px', background:'#fef2f2', color:'#b91c1c', border:'none', borderRadius:'4px', cursor:'pointer' }}>Desmarcar tots</button>
            </div>
          </div>

          {/* SUBMIT */}
          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              background: 'var(--primary-green)', 
              color: 'white', 
              padding: '16px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Enviant...' : '📤 Enviar Respostes'}
          </button>

        </form>
      )}
    </div>
  );
}
