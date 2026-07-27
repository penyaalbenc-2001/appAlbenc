'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getDiesFestesAmbDades, updateMenuFesta, updateFestesCooks, addComensalFesta, removeComensalFesta } from './actions';
import { getRespostes } from './respostes/actions';
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

function DiaFestaCard({ dia, programacion, userName, respostes, allAssignedCooksArray, isDiaPenyes, onUpdate }) {
  const [editingMenu, setEditingMenu] = useState(false);
  const [menuText, setMenuText] = useState(dia.informacion || '');
  const [savingMenu, setSavingMenu] = useState(false);

  const initialCooks = dia.cocineros ? dia.cocineros.split(/[,i]+/).map(c => c.trim()).filter(Boolean) : [];
  const [savingCooks, setSavingCooks] = useState(false);
  const [addingCook, setAddingCook] = useState(false);
  const [newCookName, setNewCookName] = useState('');

  const [savingComensals, setSavingComensals] = useState(false);
  const [addingComensal, setAddingComensal] = useState(false);
  const [deletingComensal, setDeletingComensal] = useState(false);
  const [newComensalName, setNewComensalName] = useState('');
  const [newComensalEsAdult, setNewComensalEsAdult] = useState(true);

  const dayOfWeek = (dateStr) => {
    const d = new Date(dateStr);
    const dies = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return dies[d.getDay()];
  };
  const formatDay = (dateStr) => dateStr.split('-')[2];

  const formatName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
  };

  const handleSaveMenu = async () => {
    setSavingMenu(true);
    await updateMenuFesta(dia.id, menuText, userName);
    setEditingMenu(false);
    setSavingMenu(false);
    onUpdate();
  };

  const handleRemoveCook = async (cookToRemove) => {
    setSavingCooks(true);
    const updatedCooks = initialCooks.filter(c => c !== cookToRemove);
    const newCooksString = updatedCooks.join(', ').replace(/, ([^,]*)$/, ' i $1');
    await updateFestesCooks(dia.id, newCooksString, dia.cocineros, userName);
    setSavingCooks(false);
    onUpdate();
  };

  const handleAddCook = async () => {
    if (!newCookName.trim()) return;
    setSavingCooks(true);
    const updatedCooks = [...initialCooks, newCookName.trim()];
    const newCooksString = updatedCooks.join(', ').replace(/, ([^,]*)$/, ' i $1');
    await updateFestesCooks(dia.id, newCooksString, dia.cocineros, userName);
    setNewCookName('');
    setAddingCook(false);
    setSavingCooks(false);
    onUpdate();
  };

  const handleAddComensal = async () => {
    if (!newComensalName.trim()) return;
    if (window.confirm(`Estàs segur que vols afegir a ${newComensalName} com a ${newComensalEsAdult ? 'Adult' : 'Xiquet'} el dia ${formatDay(dia.fecha)}?`)) {
      setSavingComensals(true);
      await addComensalFesta(dia.fecha, newComensalName.trim(), newComensalEsAdult, userName);
      setNewComensalName('');
      setAddingComensal(false);
      setSavingComensals(false);
      onUpdate();
    }
  };

  const handleRemoveComensal = async (comensal) => {
    if (window.confirm(`Estàs segur que vols esborrar a ${comensal.nom_cognoms} d'aquest dia?`)) {
      setSavingComensals(true);
      await removeComensalFesta(dia.fecha, comensal.nom_cognoms, userName);
      setSavingComensals(false);
      onUpdate();
    }
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
        {!isDiaPenyes && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>🧑‍🍳 Cuiners</h3>
              {!addingCook && (
                <button onClick={() => setAddingCook(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary-blue)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                  + Afegir
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
              {initialCooks.length === 0 ? (
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Sense assignar</span>
              ) : (
                initialCooks.map((cook, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue-dark)', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
                    {formatName(cook)}
                    <button 
                      onClick={() => handleRemoveCook(cook)} 
                      disabled={savingCooks}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue-dark)', cursor: savingCooks ? 'wait' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}
                      title="Eliminar cuiner"
                    >
                      ✖
                    </button>
                  </div>
                ))
              )}
            </div>

            {addingCook && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select 
                  value={newCookName} 
                  onChange={(e) => setNewCookName(e.target.value)} 
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', width: '100%', fontSize: '14px' }}
                >
                  <option value="">-- Tria de la llista de voluntaris --</option>
                  {(() => {
                    const availableCooksForThisDay = respostes.filter(r => {
                      try {
                        const diesCuinar = typeof r.dies_cuinar === 'string' ? JSON.parse(r.dies_cuinar) : (r.dies_cuinar || []);
                        return diesCuinar.includes(dia.fecha);
                      } catch(e) { return false; }
                    });
                    
                    const availableNotAssignedToday = availableCooksForThisDay.filter(r => !initialCooks.includes(r.nom_cognoms));
                    
                    if (availableNotAssignedToday.length === 0) {
                      return <option disabled>Cap voluntari disponible hui</option>;
                    }

                    return availableNotAssignedToday.map(r => {
                      const isAlreadyCookingOtherDay = allAssignedCooksArray.includes(r.nom_cognoms);
                      return (
                        <option key={r.id} value={r.nom_cognoms} disabled={isAlreadyCookingOtherDay}>
                          {formatName(r.nom_cognoms)} {isAlreadyCookingOtherDay ? '(Ja cuina un altre dia)' : ''}
                        </option>
                      );
                    });
                  })()}
                </select>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>o escriu un nom manual:</div>
                <input 
                  type="text" 
                  value={newCookName} 
                  onChange={(e) => setNewCookName(e.target.value)} 
                  placeholder="Nom del cuiner..."
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', width: '100%', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                  <button onClick={handleAddCook} disabled={savingCooks || !newCookName.trim()} style={{ flex: 1, background: 'var(--primary-green)', color: 'white', padding: '6px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: (savingCooks || !newCookName.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {savingCooks ? 'Guardant...' : 'Afegir'}
                  </button>
                  <button onClick={() => { setAddingCook(false); setNewCookName(''); }} style={{ flex: 1, background: '#e2e8f0', color: '#475569', padding: '6px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel·lar</button>
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Comensals (Només Lectura) */}
        {!isDiaPenyes && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-main)', margin: 0 }}>
                {(() => {
                  const comensalsAquestDia = respostes.filter(r => {
                    try {
                      const diesSopar = typeof r.dies_sopar === 'string' ? JSON.parse(r.dies_sopar) : (r.dies_sopar || []);
                      return diesSopar.includes(dia.fecha);
                    } catch(e) { return false; }
                  });
                  const adultsCount = comensalsAquestDia.filter(r => r.es_adult).length;
                  const xiquetsCount = comensalsAquestDia.filter(r => !r.es_adult).length;
                  
                  return (
                    <>
                      🍽️ Comensals ({comensalsAquestDia.length})
                      <span style={{fontSize:'13px', fontWeight:'normal', marginLeft:'6px', color:'#64748b'}}>
                        (👨🏽 {adultsCount} {adultsCount === 1 ? 'Adult' : 'Adults'} - 👧🏽 {xiquetsCount} {xiquetsCount === 1 ? 'Xiquet' : 'Xiquets'})
                      </span>
                    </>
                  );
                })()}
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!addingComensal && !deletingComensal && (
                  <>
                    <button onClick={() => setAddingComensal(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary-blue)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                      + Afegir
                    </button>
                    <button onClick={() => setDeletingComensal(true)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#dc2626', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                      - Esborrar
                    </button>
                  </>
                )}
                {deletingComensal && (
                  <button onClick={() => setDeletingComensal(false)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                    Fet
                  </button>
                )}
              </div>
            </div>
            
            {addingComensal && (
              <div style={{ marginBottom: '10px', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newComensalName} 
                  onChange={(e) => setNewComensalName(e.target.value)} 
                  placeholder="Nom del comensal..."
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', width: '100%', fontSize: '14px' }}
                />
                <select 
                  value={newComensalEsAdult ? 'true' : 'false'} 
                  onChange={(e) => setNewComensalEsAdult(e.target.value === 'true')} 
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', width: '100%', fontSize: '14px' }}
                >
                  <option value="true">👨🏽 Adult</option>
                  <option value="false">👧🏽 Xiquet</option>
                </select>
                <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                  <button onClick={handleAddComensal} disabled={savingComensals || !newComensalName.trim()} style={{ flex: 1, background: 'var(--primary-green)', color: 'white', padding: '6px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: (savingComensals || !newComensalName.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {savingComensals ? 'Guardant...' : 'Afegir'}
                  </button>
                  <button onClick={() => { setAddingComensal(false); setNewComensalName(''); }} style={{ flex: 1, background: '#e2e8f0', color: '#475569', padding: '6px', borderRadius: '4px', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel·lar</button>
                </div>
              </div>
            )}

            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: dia.participantes ? 'var(--text-main)' : '#94a3b8', fontSize: '13px', minHeight: '60px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {(() => {
                const comensalsAquestDia = respostes.filter(r => {
                  try {
                    const diesSopar = typeof r.dies_sopar === 'string' ? JSON.parse(r.dies_sopar) : (r.dies_sopar || []);
                    return diesSopar.includes(dia.fecha);
                  } catch(e) { return false; }
                });
                
                if (comensalsAquestDia.length === 0) return 'Cap comensal apuntat des del formulari...';
                
                const adults = comensalsAquestDia.filter(r => r.es_adult);
                const xiquets = comensalsAquestDia.filter(r => !r.es_adult);
                
                const renderComensalBadge = (comensal) => (
                  <div key={comensal.id || comensal.nom_cognoms} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', margin: '2px 4px 2px 0' }}>
                    {formatName(comensal.nom_cognoms)}
                    {deletingComensal && (
                      <button 
                        onClick={() => handleRemoveComensal(comensal)} 
                        disabled={savingComensals}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: savingComensals ? 'wait' : 'pointer', padding: 0, opacity: 0.7, display: 'flex', alignItems: 'center' }}
                        title="Eliminar comensal"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                );

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {adults.length > 0 && (
                      <div>
                        <strong style={{display: 'block', marginBottom: '4px'}}>👨🏽 Adults:</strong> 
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>{adults.map(renderComensalBadge)}</div>
                      </div>
                    )}
                    {xiquets.length > 0 && (
                      <div>
                        <strong style={{display: 'block', marginBottom: '4px'}}>👧🏽 Xiquets:</strong> 
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>{xiquets.map(renderComensalBadge)}</div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
  const [respostes, setRespostes] = useState([]);
  const [userName, setUserName] = useState('');

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserName(user.user_metadata?.full_name || user.email);
    
    const [dies, respostesList] = await Promise.all([
      getDiesFestesAmbDades(),
      getRespostes()
    ]);
    
    setDiesFestes(dies);
    setRespostes(respostesList);
    setLoading(false);
  };

  const allAssignedCooksArray = diesFestes.flatMap(d => d.cocineros ? d.cocineros.split(/[,i]+/).map(c => c.trim()).filter(Boolean) : []);

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
              respostes={respostes}
              allAssignedCooksArray={allAssignedCooksArray}
              isDiaPenyes={isDiaPenyes}
              onUpdate={loadData}
            />
          );
        })}
      </div>

    </div>
  );
}
