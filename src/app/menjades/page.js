'use client';

import { useState, useEffect } from 'react';
import { getMenjades, addMenjada, deleteMenjada } from './actions';
import { getMembresDisponibles } from '../registre/actions'; // We can use this or create a generic getMembres
import { getMembreByUserId } from '../perfil/actions';
import { supabase } from '@/lib/supabase';

export default function MenjadesPage() {
  const [menjades, setMenjades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fecha: '', hora: '', lugar: '', cocineros: '', informacion: '' });
  const [guardant, setGuardant] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membre = await getMembreByUserId(user.id);
        if (membre) setMembreNom(membre.nom);
      }
      
      const data = await getMenjades();
      setMenjades(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setGuardant(true);
    await addMenjada(formData.fecha, formData.hora, formData.lugar, formData.cocineros, formData.informacion, membreNom);
    
    const refreshed = await getMenjades();
    setMenjades(refreshed);
    setFormData({ fecha: '', hora: '', lugar: '', cocineros: '', informacion: '' });
    setShowForm(false);
    setGuardant(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Segur que vols eliminar aquesta menjada?')) return;
    setMenjades(menjades.filter(m => m.id !== id));
    await deleteMenjada(id, membreNom);
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant menjades...</div>;

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title" style={{ margin: 0 }}>Menjars</h1>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 15px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel·lar' : '+ Nova'}
        </button>
      </div>
      
      {showForm && (
        <div className="card fade-in">
          <h3 style={{ marginBottom: '15px' }}>Programar Menjar</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Data (ex: 20 d'abril)" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required className="form-input" />
            <input type="text" placeholder="Hora (ex: 14:00)" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} className="form-input" />
            <input type="text" placeholder="Lloc" value={formData.lugar} onChange={e => setFormData({...formData, lugar: e.target.value})} className="form-input" />
            <input type="text" placeholder="Cuiners (ex: Alfonso i Xisco)" value={formData.cocineros} onChange={e => setFormData({...formData, cocineros: e.target.value})} required className="form-input" />
            <textarea placeholder="Menú o informació extra..." value={formData.informacion} onChange={e => setFormData({...formData, informacion: e.target.value})} className="form-input" rows={3}></textarea>
            <button type="submit" className="btn-primary" disabled={guardant}>{guardant ? 'Guardant...' : 'Crear Menjar'}</button>
          </form>
          <style jsx>{`
            .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); }
          `}</style>
        </div>
      )}

      <div>
        {menjades.length === 0 ? (
          <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>🍽️ No hi ha cap menjar programat de moment.</p></div>
        ) : (
          menjades.map((m, i) => (
            <div key={m.id ? `id-${m.id}` : `idx-${i}`} className="card" style={{ borderLeft: '4px solid var(--primary-green)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '1.1rem' }}>{m.fecha || m.dia}</strong>
                <span className="badge badge-green">{m.estado || 'Programada'}</span>
              </div>
              <p style={{ margin: '5px 0' }}>🕐 {m.hora || 'Sense hora'} | 📍 {m.lugar || 'El local'}</p>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                <p><strong>🍳 Cuiners:</strong> {m.cocineros}</p>
                {m.informacion && <p style={{ marginTop: '5px', color: '#475569', fontSize: '0.9rem' }}>{m.informacion}</p>}
              </div>
              
              <button 
                onClick={() => handleDelete(m.id)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', color: '#ef4444' }}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
