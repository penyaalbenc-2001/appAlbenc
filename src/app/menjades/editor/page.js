'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getMembreByUserId } from '@/app/perfil/actions';
import { getMenjades, getAllMembres, executeSwap, executeAddRemove } from '../actions';

export default function EditorCuinersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  
  const [menjades, setMenjades] = useState([]);
  const [membres, setMembres] = useState([]);
  const [mode, setMode] = useState('swap'); // 'swap' or 'modify'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Swap State
  const [meal1Id, setMeal1Id] = useState('');
  const [cook1Id, setCook1Id] = useState('');
  const [meal2Id, setMeal2Id] = useState('');
  const [cook2Id, setCook2Id] = useState('');

  // Modify State
  const [actionMealId, setActionMealId] = useState('');
  const [actionType, setActionType] = useState('add'); // 'add' or 'remove'
  const [targetCookId, setTargetCookId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const m = await getMembreByUserId(user.id);
        if (m) setMembreNom(m.nom);

        const fetchedMenjades = await getMenjades();
        const futureMenjades = fetchedMenjades.filter(m => new Date(m.fecha) >= new Date());
        
        const fetchedMembres = await getAllMembres();

        setMenjades(futureMenjades);
        setMembres(fetchedMembres);
      } catch (err) {
        console.error(err);
        setError("Error en carregar les dades.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Helpers
  const extractCooks = (str) => {
    if (!str) return [];
    const s = str.toLowerCase();
    return membres.filter(m => s.includes(m.nom.toLowerCase()));
  };

  const cleanUpString = (str) => {
    return str.replace(/,\s*,/g, ',').replace(/\s+i\s+i\s+/g, ' i ').replace(/^[\s,y,i,e]+|[\s,y,i,e]+$/g, '').trim();
  };

  const replaceCook = (str, oldCook, newCook) => {
    if (!str) return newCook;
    const res = str.replace(new RegExp(oldCook, 'gi'), newCook);
    return cleanUpString(res);
  };

  const removeCook = (str, cook) => {
    if (!str) return "";
    const res = str.replace(new RegExp(cook, 'gi'), '');
    return cleanUpString(res);
  };

  const handleSwap = async () => {
    if (!meal1Id || !cook1Id || !meal2Id || !cook2Id) {
      setError("Has de triar totes les opcions per a fer l'intercanvi.");
      return;
    }
    if (meal1Id === meal2Id) {
      setError("Les dos menjades han de ser diferents.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const m1 = menjades.find(m => m.id.toString() === meal1Id);
      const m2 = menjades.find(m => m.id.toString() === meal2Id);
      const c1 = membres.find(m => m.id.toString() === cook1Id).nom;
      const c2 = membres.find(m => m.id.toString() === cook2Id).nom;

      const newM1Cocineros = replaceCook(m1.cocineros, c1, c2);
      const newM2Cocineros = replaceCook(m2.cocineros, c2, c1);

      await executeSwap(
        m1.id, newM1Cocineros, m1.fecha || m1.dia, 
        m2.id, newM2Cocineros, m2.fecha || m2.dia, 
        membreNom, c1, c2
      );
      
      router.push('/');
    } catch (err) {
      console.error(err);
      setError("S'ha produït un error al guardar els canvis.");
      setSaving(false);
    }
  };

  const handleModify = async () => {
    if (!actionMealId || !targetCookId) {
      setError("Has de triar la menjada i la persona.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const m = menjades.find(meal => meal.id.toString() === actionMealId);
      const cookName = membres.find(mem => mem.id.toString() === targetCookId).nom;
      
      let newCocineros = m.cocineros || "";
      if (actionType === 'add') {
        if (!newCocineros) newCocineros = cookName;
        else newCocineros = newCocineros + " i " + cookName;
      } else {
        newCocineros = removeCook(newCocineros, cookName);
      }

      await executeAddRemove(
        m.id, newCocineros, m.fecha || m.dia, membreNom, actionType, cookName
      );

      router.push('/');
    } catch (err) {
      console.error(err);
      setError("S'ha produït un error al guardar els canvis.");
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant editor...</div>;

  const meal1 = menjades.find(m => m.id?.toString() === meal1Id);
  const cooks1 = meal1 ? extractCooks(meal1.cocineros) : [];
  
  const meal2 = menjades.find(m => m.id?.toString() === meal2Id);
  const cooks2 = meal2 ? extractCooks(meal2.cocineros) : [];

  const actMeal = menjades.find(m => m.id?.toString() === actionMealId);
  const actCooks = actMeal ? extractCooks(actMeal.cocineros) : [];

  const formatMealOption = (m) => {
    let diaLimpio = '';
    if (m.dia) {
      diaLimpio = m.dia.replace(/_/g, ' ').toUpperCase();
    }
    return `${m.fecha || ''} ${diaLimpio ? `(${diaLimpio})` : ''}`;
  };

  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
      <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>
        ← Tornar
      </button>
      
      <h1 className="title" style={{ marginBottom: '10px' }}>Gestió de Cuiners</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.4' }}>
        Selecciona ràpidament qui cuina cada dia utilitzant els desplegables, sense escriure. Tots els canvis s'avisaran automàticament al Telegram de la Penya.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => { setMode('swap'); setError(null); }} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', backgroundColor: mode === 'swap' ? 'var(--primary-blue)' : '#e2e8f0', color: mode === 'swap' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
        >
          🔄 Intercanviar
        </button>
        <button 
          onClick={() => { setMode('modify'); setError(null); }} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', backgroundColor: mode === 'modify' ? 'var(--primary-green)' : '#e2e8f0', color: mode === 'modify' ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
        >
          ➕ / ➖ Afegir o Llevar
        </button>
      </div>

      {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {mode === 'swap' && (
        <div className="card fade-in" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary-blue)' }}>Mode Intercanvi</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Primera Menjada</label>
              <select className="form-input" value={meal1Id} onChange={(e) => { setMeal1Id(e.target.value); setCook1Id(''); }}>
                <option value="">-- Tria el primer dia --</option>
                {menjades.map(m => (
                  <option key={`m1-${m.id}`} value={m.id}>{formatMealOption(m)}</option>
                ))}
              </select>
              
              {meal1Id && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-orange)' }}>Qui ix?</label>
                  <select className="form-input" value={cook1Id} onChange={(e) => setCook1Id(e.target.value)}>
                    <option value="">-- Tria quin cuiner eixirà --</option>
                    {cooks1.map(c => <option key={`c1-${c.id}`} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>🔄</div>

            <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Segona Menjada</label>
              <select className="form-input" value={meal2Id} onChange={(e) => { setMeal2Id(e.target.value); setCook2Id(''); }}>
                <option value="">-- Tria el segon dia --</option>
                {menjades.map(m => (
                  <option key={`m2-${m.id}`} value={m.id}>{formatMealOption(m)}</option>
                ))}
              </select>
              
              {meal2Id && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-green)' }}>Qui entra en el seu lloc?</label>
                  <select className="form-input" value={cook2Id} onChange={(e) => setCook2Id(e.target.value)}>
                    <option value="">-- Tria el substitut --</option>
                    {cooks2.map(c => <option key={`c2-${c.id}`} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button 
              className="btn-primary" 
              onClick={handleSwap} 
              disabled={saving} 
              style={{ marginTop: '10px', fontSize: '1.1rem', padding: '15px', backgroundColor: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }}
            >
              {saving ? 'Executant Intercanvi...' : 'Confirma Intercanvi'}
            </button>
          </div>
        </div>
      )}

      {mode === 'modify' && (
        <div className="card fade-in" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary-green)' }}>Afegir o Llevar</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Dia de la Menjada</label>
              <select className="form-input" value={actionMealId} onChange={(e) => { setActionMealId(e.target.value); setTargetCookId(''); }}>
                <option value="">-- Tria el dia --</option>
                {menjades.map(m => (
                  <option key={`am-${m.id}`} value={m.id}>{formatMealOption(m)}</option>
                ))}
              </select>
            </div>

            {actionMealId && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => { setActionType('add'); setTargetCookId(''); }} 
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: actionType === 'add' ? '2px solid var(--primary-green)' : '1px solid #cbd5e1', background: actionType === 'add' ? '#ecfdf5' : 'white', fontWeight: 'bold' }}
                >
                  ➕ Afegir
                </button>
                <button 
                  onClick={() => { setActionType('remove'); setTargetCookId(''); }} 
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: actionType === 'remove' ? '2px solid var(--primary-orange)' : '1px solid #cbd5e1', background: actionType === 'remove' ? '#fff7ed' : 'white', fontWeight: 'bold' }}
                >
                  ➖ Llevar
                </button>
              </div>
            )}

            {actionMealId && actionType === 'add' && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Qui s'apunta a cuinar?</label>
                <select className="form-input" value={targetCookId} onChange={(e) => setTargetCookId(e.target.value)}>
                  <option value="">-- Tria un membre --</option>
                  {membres.map(m => <option key={`add-${m.id}`} value={m.id}>{m.nom}</option>)}
                </select>
              </div>
            )}

            {actionMealId && actionType === 'remove' && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Qui es dona de baixa?</label>
                <select className="form-input" value={targetCookId} onChange={(e) => setTargetCookId(e.target.value)}>
                  <option value="">-- Tria qui llevar --</option>
                  {actCooks.map(c => <option key={`rm-${c.id}`} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleModify} 
              disabled={saving} 
              style={{ marginTop: '10px', fontSize: '1.1rem', padding: '15px', backgroundColor: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}
            >
              {saving ? 'Guardant...' : (actionType === 'add' ? 'Afegeix Cuiner' : 'Lleva Cuiner')}
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 1rem; }
      `}</style>
    </div>
  );
}
