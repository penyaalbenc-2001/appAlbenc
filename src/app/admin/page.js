'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === 'penyaalbenc@gmail.com') {
        setIsAdmin(true);
      }
      setLoading(false);
    }
    checkAdmin();
  }, []);

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Comprovant permisos...</div>;

  if (!isAdmin) {
    return (
      <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>
        <h1 className="title" style={{ color: '#ef4444' }}>Accés Denegat</h1>
        <p>Aquesta secció és només per a l'Administrador.</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>Tornar a l'Inici</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <h1 className="title" style={{ color: 'var(--primary-blue-dark)' }}>⚙️ Panell d'Administració</h1>
      
      <div className="card fade-in" style={{ borderLeft: '4px solid var(--primary-blue)', marginBottom: '20px' }}>
        <h2>Gestió Base de Dades</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>
          Benvingut al panell administratiu de la Penya. Pròximament en aquesta secció podràs editar o esborrar de manera avançada qualsevol registre directament sense restriccions.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn-primary" style={{ background: 'var(--primary-blue-dark)' }} onClick={() => alert('Pròximament: Editor SQL / Gestor de membres')}>
            👥 Gestionar Membres
          </button>
          <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => alert('Pròximament: Esborrat massiu d\'activitat')}>
            🗑️ Netejar Historial d'Activitat
          </button>
        </div>
      </div>
    </div>
  );
}
