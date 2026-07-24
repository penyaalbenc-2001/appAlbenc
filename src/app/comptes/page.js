'use client';

import { useState, useEffect } from 'react';
import { getComptes, addCompte, deleteCompte } from './actions';
import { getMembreByUserId } from '../perfil/actions';
import { supabase } from '@/lib/supabase';

export default function ComptesPage() {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ concepte: '', import: '', tipus: 'despesa', data: new Date().toISOString().split('T')[0], adjunt: '' });
  const [guardant, setGuardant] = useState(false);
  
  // Modal estat per veure la foto en gran
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membre = await getMembreByUserId(user.id);
        if (membre) setMembreNom(membre.nom);
      }
      
      const data = await getComptes();
      setComptes(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setGuardant(true);
    await addCompte(formData.concepte, formData.import, formData.tipus, formData.data, membreNom, formData.adjunt);
    
    const refreshed = await getComptes();
    setComptes(refreshed);
    setFormData({ concepte: '', import: '', tipus: 'despesa', data: new Date().toISOString().split('T')[0], adjunt: '' });
    setShowForm(false);
    setGuardant(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, adjunt: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id, concepte) => {
    if (!confirm('Segur que vols eliminar aquest moviment econòmic?')) return;
    setComptes(comptes.filter(c => c.id !== id));
    await deleteCompte(id, concepte, membreNom);
  };

  const calcularSaldo = () => {
    return comptes.reduce((acc, curr) => {
      const valor = parseFloat(curr.import);
      return curr.tipus === 'ingres' ? acc + valor : acc - valor;
    }, 0);
  };

  const saldo = calcularSaldo();

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Calculant balanç econòmic...</div>;

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      
      {/* Saldo Actual */}
      <div style={{ textAlign: 'center', marginBottom: '30px', backgroundColor: '#1e293b', color: 'white', padding: '30px 20px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Actual Penya</h2>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: saldo >= 0 ? '#4ade80' : '#f87171' }}>
          {saldo.toFixed(2)} €
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title" style={{ margin: 0 }}>Llibre de Comptes</h1>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 15px', backgroundColor: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel·lar' : '+ Nou Moviment'}
        </button>
      </div>
      
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary-blue)' }}>
          <h3 style={{ marginBottom: '15px' }}>Registrar Moviment</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-main)' }}>Tipus d'Operació</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, padding: '10px', textAlign: 'center', border: formData.tipus === 'despesa' ? '2px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: formData.tipus === 'despesa' ? '#fef2f2' : 'white', fontWeight: formData.tipus === 'despesa' ? 'bold' : 'normal', color: formData.tipus === 'despesa' ? '#ef4444' : 'var(--text-main)' }}>
                  <input type="radio" checked={formData.tipus === 'despesa'} onChange={() => setFormData({...formData, tipus: 'despesa'})} style={{ display: 'none' }} />
                  📉 Despesa
                </label>
                <label style={{ flex: 1, padding: '10px', textAlign: 'center', border: formData.tipus === 'ingres' ? '2px solid #22c55e' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: formData.tipus === 'ingres' ? '#f0fdf4' : 'white', fontWeight: formData.tipus === 'ingres' ? 'bold' : 'normal', color: formData.tipus === 'ingres' ? '#22c55e' : 'var(--text-main)' }}>
                  <input type="radio" checked={formData.tipus === 'ingres'} onChange={() => setFormData({...formData, tipus: 'ingres'})} style={{ display: 'none' }} />
                  📈 Ingrés
                </label>
                <label style={{ flex: 1, padding: '10px', textAlign: 'center', border: formData.tipus === 'derrama' ? '2px solid var(--primary-orange)' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: formData.tipus === 'derrama' ? '#fff7ed' : 'white', fontWeight: formData.tipus === 'derrama' ? 'bold' : 'normal', color: formData.tipus === 'derrama' ? 'var(--primary-orange)' : 'var(--text-main)' }}>
                  <input type="radio" checked={formData.tipus === 'derrama'} onChange={() => setFormData({...formData, tipus: 'derrama'})} style={{ display: 'none' }} />
                  💰 Derrama
                </label>
              </div>
              {formData.tipus === 'derrama' && (
                <p style={{ fontSize: '12px', color: 'var(--primary-orange)', margin: '8px 0 0 0', fontWeight: 'bold' }}>
                  ⚠️ L'import que poses baix es multiplicarà automàticament per 15 (tots els socis de la Penya).
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-main)' }}>Data</label>
                <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required className="form-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{formData.tipus === 'derrama' ? 'Import per soci' : 'Import total'}</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={formData.import} onChange={e => setFormData({...formData, import: e.target.value})} required className="form-input" style={{ paddingRight: '30px' }} />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold' }}>€</span>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-main)' }}>Concepte</label>
              <input type="text" placeholder="Ex: Compra carn, Beguda festes, Derrama Agost..." value={formData.concepte} onChange={e => setFormData({...formData, concepte: e.target.value})} required className="form-input" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-main)' }}>Foto del Tiquet (Opcional)</label>
              
              <label style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                background: '#f1f5f9', color: 'var(--primary-blue)', 
                padding: '12px 15px', borderRadius: '8px', 
                cursor: 'pointer', border: '1px dashed var(--primary-blue)',
                fontWeight: 'bold', width: '100%', justifyContent: 'center'
              }}>
                📷 Fer Foto o Pujar Arxiu
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }}
                />
              </label>
              {formData.adjunt && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={formData.adjunt} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>✓ Foto llista</span>
                  <button type="button" onClick={() => setFormData({...formData, adjunt: ''})} style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>Llevar</button>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={guardant} style={{ marginTop: '10px' }}>
              {guardant ? 'Guardant...' : 'Registrar Moviment'}
            </button>
          </form>
          <style jsx>{`
            .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); font-family: inherit; font-size: 16px; }
          `}</style>
        </div>
      )}

      {/* Llistat de Comptes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comptes.length === 0 ? (
          <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>💶 Encara no hi ha cap moviment registrat.</p></div>
        ) : (
          comptes.map((c, i) => {
            const isIngres = c.tipus === 'ingres';
            
            // Format data to typical Spanish style (DD/MM/YYYY)
            const dateObj = new Date(c.data);
            const dataFormatejada = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

            return (
              <div key={c.id || `compte-${i}`} className="card" style={{ 
                borderLeft: `4px solid ${isIngres ? '#22c55e' : '#ef4444'}`, 
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px'
              }}>
                <div style={{ flex: 1, paddingRight: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}>{dataFormatejada}</div>
                  <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {c.concepte}
                    {c.adjunt && (
                      <button 
                        onClick={() => setSelectedImage(c.adjunt)}
                        style={{ background: '#f1f5f9', border: 'none', color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '50%', width: '28px', height: '28px', flexShrink: 0, cursor: 'pointer' }} 
                        title="Vore justificant"
                      >
                        📷
                      </button>
                    )}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>Afegit per {c.membre_nom || 'Anònim'}</div>
                </div>
                
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: isIngres ? '#22c55e' : '#ef4444' 
                  }}>
                    {isIngres ? '+' : '-'}{parseFloat(c.import).toFixed(2)} €
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(c.id, c.concepte)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '12px', textDecoration: 'underline', marginTop: '8px', cursor: 'pointer', padding: 0 }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Visor de Foto */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <button 
            onClick={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10000 }}
          >
            ✕
          </button>
          <img 
            src={selectedImage} 
            alt="Tiquet Adjunt" 
            style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }} 
          />
        </div>
      )}
    </div>
  );
}
