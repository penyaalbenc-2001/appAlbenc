'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getRegisteredUsers, deleteUser } from './actions';

export default function UsuarisAdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === 'penyaalbenc@gmail.com') {
        setIsAdmin(true);
        setAdminEmail(user.email);
        loadUsers();
      } else {
        setLoading(false);
      }
    }
    checkAdmin();
  }, []);

  async function loadUsers() {
    try {
      const data = await getRegisteredUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Error carregant els usuaris.");
    } finally {
      setLoading(false);
      setLoadingUsers(false);
    }
  }

  const handleDelete = async (authId, membreId, nom) => {
    if (!confirm(`Estàs segur que vols eliminar l'usuari de ${nom}?\nAixò esborrarà les seues credencials i haurà de tornar a registrar-se.`)) {
      return;
    }
    
    setDeletingId(authId);
    try {
      await deleteUser(authId, membreId, adminEmail, nom);
      // Remove from UI
      setUsers(users.filter(u => u.auth_id !== authId));
      alert(`Usuari de ${nom} eliminat correctament.`);
    } catch (err) {
      alert("Error a l'eliminar l'usuari. Revisa la consola.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconegut';
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <Link href="/admin" style={{ color: 'var(--primary-blue)', fontSize: '1.5rem', textDecoration: 'none' }}>
          &larr;
        </Link>
        <h1 className="title" style={{ color: 'var(--primary-blue-dark)', margin: 0 }}>Gestió d'Usuaris</h1>
      </div>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <div className="card fade-in">
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          A continuació es mostren els membres que ja s'han registrat a l'aplicació. Pots eliminar-los per desvincular el seu correu i permetre que es tornen a registrar.
        </p>
        
        {loadingUsers ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Carregant llista d'usuaris...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            No hi ha usuaris registrats actualment.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Nom de la Penya</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Correu Electrònic</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Data de Registre</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.auth_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{user.nom}</td>
                    <td style={{ padding: '12px 8px' }}>{user.email}</td>
                    <td style={{ padding: '12px 8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(user.auth_id, user.membre_id, user.nom)}
                        disabled={deletingId === user.auth_id || user.email === 'penyaalbenc@gmail.com'}
                        style={{
                          background: user.email === 'penyaalbenc@gmail.com' ? '#ccc' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: user.email === 'penyaalbenc@gmail.com' ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {deletingId === user.auth_id ? 'Eliminant...' : (user.email === 'penyaalbenc@gmail.com' ? 'Admin' : 'Esborrar')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
