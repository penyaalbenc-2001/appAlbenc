'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getDiesFestesAmbDades, updateMenuFesta, updateComensalsFesta } from './actions';
import Link from 'next/link';

const programacion2026 = {
  '2026-08-07': [
    { hora: '22:30', acto: 'Presentació a la Plaça de Bous.' },
    { hora: '00:00', acto: 'Discomòbil DJ Cuber.' }
  ],
  '2026-08-08': [
    { hora: '17:00', acto: 'Corro vaques i prova del bou "Playero".' },
    { hora: '19:00', acto: 'Tardeo grup Bandurrock.' },
    { hora: '23:30', acto: 'Bou embolat "Playero".' },
    { hora: '00:00', acto: 'Orquestra Centauro i Disco Swing Zoom.' }
  ],
  '2026-08-09': [
    { hora: '17:00', acto: 'Concurs de retalladors.' },
    { hora: '19:00', acto: 'Tardeo grup Marisma.' },
    { hora: '22:30', acto: 'Concurs d\'emboladors.' }
  ],
  '2026-08-10': [
    { hora: '16:30', acto: 'Jocs entre penyes amb vaques.' },
    { hora: '21:00', acto: 'Sopar de penyes i discomòbil Bandalay.' }
  ],
  '2026-08-11': [
    { hora: '17:00', acto: 'Corro vaques i prova bou "Funcionario".' },
    { hora: '23:00', acto: 'Bou embolat "Funcionario".' },
    { hora: '00:30', acto: 'Orquestra La Contrabanda.' }
  ],
  '2026-08-12': [
    { hora: '17:30', acto: 'Trobadorets a la Plaça de Bous.' },
    { hora: '00:00', acto: 'Desfilada de disfresses. Ball Afrikanía.' }
  ],
  '2026-08-13': [
    { hora: '17:30', acto: 'Corro vaques i entrada bou "Nata".' },
    { hora: '19:30', acto: 'Vesprada rock: Batakazo, Llar Sounds.' },
    { hora: '23:00', acto: 'Bou embolat "Nata".' },
    { hora: '23:30', acto: 'Nit del rock: Hereus, Garrama, DJ Keyzz.' }
  ],
  '2026-08-14': [
    { hora: '17:00', acto: 'Corro vaques i prova bou "Ranillo".' },
    { hora: '19:00', acto: 'Tardeo grup Indocencia.' },
    { hora: '22:30', acto: 'Bou embolat "Ranillo".' },
    { hora: '00:00', acto: 'Tu Cara Me Suena. Grup Los Mejores.' }
  ],
  '2026-08-15': [
    { hora: '17:00', acto: 'Entrada caixons i bou "Carabinero".' },
    { hora: '19:00', acto: 'Tardeo i concurs postres.' },
    { hora: '23:30', acto: 'Bou embolat "Carabinero".' },
    { hora: '00:30', acto: 'Concert Maruja Limón.' }
  ],
  '2026-08-16': [
    { hora: '17:00', acto: 'Espectacle La Tia Visantica.' },
    { hora: '20:00', acto: 'Ball Pla infantil.' },
    { hora: '22:30', acto: 'Ball Pla.' },
    { hora: '00:00', acto: 'Traca final de festes.' }
  ]
};

function DiaFestaCard({ dia, programacion, userName, isDiaPenyes, onUpdate }) {
  const [editingMenu, setEditingMenu] = useState(false);
  const [menuText, setMenuText] = useState(dia.informacion || '');
  const [savingMenu, setSavingMenu] = useState(false);

  const [editingComensals, setEditingComensals] = useState(false);
  const [comensalsText, setComensalsText] = useState(dia.participantes || '');
  const [savingComensals, setSavingComensals] = useState(false);

  const dayOfWeek = (dateStr) => {
    const d = new Date(dateStr);
    const dies = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return dies[d.getDay()];
  };
  const formatDay = (dateStr) => dateStr.split('-')[2];

  const handleSaveMenu = async () => {
    setSavingMenu(true);
    await updateMenuFesta(dia.id, menuText, userName);
    setEditingMenu(false);
    setSavingMenu(false);
    onUpdate();
  };

  const handleSaveComensals = async () => {
    setSavingComensals(true);
    await updateComensalsFesta(dia.id, comensalsText, userName);
    setEditingComensals(false);
    setSavingComensals(false);
    onUpdate();
  };

  return (
    <div className="card" style={{ 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      border: isDiaPenyes ? '2px solid #ef4444' : 'none',
      height: '100%'
    }}>
      {/* Capçalera del dia */}
      <div style={{ 
        backgroundColor: isDiaPenyes ? '#ef4444' : '#1e293b', 
        color: 'white', 
        padding: '15px', 
        textAlign: 'center',
        borderBottom: '1px solid #cbd5e1'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>{dayOfWeek(dia.fecha)} {formatDay(dia.fecha)}</h2>
        {isDiaPenyes && <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>DIA DE LES PENYES</p>}
      </div>

      <div style={{ padding: '20px', backgroundColor: isDiaPenyes ? '#fef2f2' : 'white', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Cuiners assignats */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>🧑‍🍳 Cuiners</h3>
            <Link href={`/menjades/editor?id=${dia.id}`} style={{ fontSize: '12px', color: 'var(--primary-blue)', textDecoration: 'underline' }}>
              Editar
            </Link>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: dia.cocineros ? 'var(--text-main)' : '#94a3b8', fontSize: '14px', minHeight: '42px' }}>
            {dia.cocineros || 'Sense assignar'}
          </div>
        </div>

        {/* Menú */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>🥘 Menú</h3>
            {!editingMenu ? (
              <button onClick={() => setEditingMenu(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary-blue)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                Editar
              </button>
            ) : null}
          </div>
          
          {editingMenu ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                value={menuText} 
                onChange={e => setMenuText(e.target.value)} 
                placeholder="Ex: Paella de marisc" 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--primary-blue)', width: '100%', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handleSaveMenu} disabled={savingMenu} style={{ background: 'var(--primary-green)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{savingMenu ? 'Guardant...' : 'Guardar'}</button>
                <button onClick={() => { setEditingMenu(false); setMenuText(dia.informacion || ''); }} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel·lar</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: dia.informacion ? 'var(--text-main)' : '#94a3b8', fontSize: '14px', minHeight: '42px', fontWeight: dia.informacion ? 'bold' : 'normal' }}>
              {dia.informacion || 'Escriu el menú...'}
            </div>
          )}
        </div>

        {/* Comensals */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>🍽️ Comensals ({dia.participantes ? dia.participantes.split(',').filter(p => p.trim()).length : 0})</h3>
            {!editingComensals ? (
              <button onClick={() => setEditingComensals(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary-blue)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                Editar
              </button>
            ) : null}
          </div>
          
          {editingComensals ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea 
                value={comensalsText} 
                onChange={e => setComensalsText(e.target.value)} 
                placeholder="Separa els noms per comes..." 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--primary-blue)', width: '100%', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handleSaveComensals} disabled={savingComensals} style={{ background: 'var(--primary-blue)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>{savingComensals ? 'Guardant...' : 'Guardar'}</button>
                <button onClick={() => { setEditingComensals(false); setComensalsText(dia.participantes || ''); }} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel·lar</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: dia.participantes ? 'var(--text-main)' : '#94a3b8', fontSize: '13px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {dia.participantes || 'Cap comensal afegit...'}
            </div>
          )}
        </div>

        {/* Programació del dia */}
        <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
            📅 Programació Oficial
          </h3>
          <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {programacion.map((prog, idx) => (
              <li key={idx} style={{ fontSize: '13px', display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-orange)', minWidth: '40px' }}>{prog.hora}</span>
                <span style={{ color: '#475569' }}>{prog.acto}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default function FestesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [diesFestes, setDiesFestes] = useState([]);
  const [userName, setUserName] = useState('');

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserName(user.user_metadata?.full_name || user.email);
    
    const dies = await getDiesFestesAmbDades();
    setDiesFestes(dies);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [router]);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Carregant Festes...</div>;

  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 className="title" style={{ margin: 0 }}>🎉 Festes 2026</h1>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Organització, menús i programació</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              const url = window.location.origin + '/festes/formulari';
              navigator.clipboard.writeText(url);
              alert('Enllaç del formulari copiat per compartir al grup!');
            }}
            className="btn-primary" 
            style={{ padding: '10px 15px', backgroundColor: 'var(--primary-orange)', borderColor: 'var(--primary-orange)' }}
          >
             🔗 Copiar Enllaç Formulari
          </button>
          <Link href="/festes/respostes" className="btn-primary" style={{ padding: '10px 15px', textDecoration: 'none' }}>
            📊 Disponibilitat (Formulari)
          </Link>
          <Link href="/festes/estadistiques" className="btn-primary" style={{ padding: '10px 15px', textDecoration: 'none', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>
            📈 Estadístiques Històriques
          </Link>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px' 
      }}>
        {diesFestes.map((dia, idx) => {
          const isDiaPenyes = dia.fecha === '2026-08-10';
          const programacion = programacion2026[dia.fecha] || [];

          return (
            <DiaFestaCard 
              key={dia.id || `dia-${idx}`} 
              dia={dia} 
              programacion={programacion} 
              userName={userName}
              isDiaPenyes={isDiaPenyes}
              onUpdate={loadData}
            />
          );
        })}
      </div>

    </div>
  );
}
