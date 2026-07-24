'use client';

import { useState, useEffect } from 'react';
import { getCompraItems, addCompraItem, toggleCompraItem, deleteCompraItem } from './actions';
import { getMembreByUserId } from '../perfil/actions';
import { supabase } from '@/lib/supabase';

export default function LlistaCompraPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  
  const [nouProducte, setNouProducte] = useState('');
  const [novaQuantitat, setNovaQuantitat] = useState('');
  const [afegint, setAfegint] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membre = await getMembreByUserId(user.id);
        if (membre) setMembreNom(membre.nom);
      }
      
      const data = await getCompraItems();
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nouProducte) return;
    setAfegint(true);
    
    await addCompraItem(nouProducte, novaQuantitat || '1', membreNom);
    
    const refreshedData = await getCompraItems();
    setItems(refreshedData);
    setNouProducte('');
    setNovaQuantitat('');
    setAfegint(false);
  };

  const handleToggle = async (item) => {
    // Optimistic update
    setItems(items.map(i => i.id === item.id ? { ...i, estado: i.estado === 'pendent' ? 'comprat' : 'pendent' } : i));
    await toggleCompraItem(item.id, item.estado, item.objeto, membreNom);
  };

  const handleDelete = async (id) => {
    if (!confirm('Segur que vols eliminar aquest producte?')) return;
    const itemToDelete = items.find(i => i.id === id);
    setItems(items.filter(i => i.id !== id));
    
    try {
      if (itemToDelete) {
        await deleteCompraItem(id, itemToDelete.objeto, membreNom);
      } else {
        await deleteCompraItem(id, 'un producte', membreNom);
      }
    } catch (error) {
      console.error("Failed to delete item", error);
      alert("Error eliminant el producte");
      // Revertir canvi si falla
      const refreshedData = await getCompraItems();
      setItems(refreshedData);
    }
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant llista...</div>;

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <h1 className="title">Llista de la Compra</h1>
      
      <div className="card">
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <input 
              type="text" 
              placeholder="Ex: Tomaques..." 
              value={nouProducte}
              onChange={e => setNouProducte(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Quantitat" 
              value={novaQuantitat}
              onChange={e => setNovaQuantitat(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={afegint} style={{ width: 'auto', padding: '0 20px' }}>
            +
          </button>
        </form>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>La llista està buida.</p></div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.estado === 'comprat' ? 0.6 : 1 }}>
                <div 
                  onClick={() => handleToggle(item)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '12px', 
                    border: '2px solid var(--primary-blue)',
                    backgroundColor: item.estado === 'comprat' ? 'var(--primary-blue)' : 'transparent',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}>
                    {item.estado === 'comprat' && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', textDecoration: item.estado === 'comprat' ? 'line-through' : 'none' }}>
                      {item.objeto}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Quantitat: {item.cantidad || '1'} • Per: {item.usuario || 'Algú'}
                    </p>
                  </div>
                </div>
                
                <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', color: '#ef4444', padding: '10px' }}>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
