'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMembresDisponibles, assignarMembre } from './actions';

export default function Registre() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [membres, setMembres] = useState([]);
  const [selectedMembreId, setSelectedMembreId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadMembres() {
      try {
        const disponibles = await getMembresDisponibles();
        setMembres(disponibles);
      } catch (err) {
        console.error(err);
        setError("Error carregant els membres.");
      } finally {
        setLoading(false);
      }
    }
    loadMembres();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedMembreId) {
      setError("Has de seleccionar qui eres de la penya.");
      return;
    }
    setRegistering(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setRegistering(false);
      return;
    }

    if (data?.user) {
      // Assign the member in the DB
      try {
        await assignarMembre(parseInt(selectedMembreId), data.user.id);
        router.push('/');
        router.refresh();
      } catch (dbError) {
        setError("L'usuari s'ha creat, però hi ha hagut un error assignant el membre: " + dbError.message);
        setRegistering(false);
      }
    } else {
      setError("No s'ha pogut crear l'usuari. És possible que el correu ja estiga registrat.");
      setRegistering(false);
    }
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant membres...</div>;

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '100px' }}>
      <h1 className="title" style={{ textAlign: 'center' }}>Crea el teu compte</h1>
      <div className="card">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
          
          <div>
            <label style={{ fontWeight: '600', marginBottom: '5px', display: 'block' }}>Qui eres?</label>
            <select 
              value={selectedMembreId} 
              onChange={(e) => setSelectedMembreId(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
            >
              <option value="" disabled>Selecciona el teu nom</option>
              {membres.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Només es mostren els membres que encara no tenen compte.</small>
          </div>

          <div>
            <label style={{ fontWeight: '600', marginBottom: '5px', display: 'block' }}>Correu Electrònic</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: '600', marginBottom: '5px', display: 'block' }}>Contrasenya</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                style={{ width: '100%', padding: '12px', paddingRight: '45px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '5px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={registering} style={{ marginTop: '10px' }}>
            {registering ? 'Registrant...' : 'Registrar-se'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Ja tens compte? <Link href="/login" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>Inicia sessió</Link>
        </p>
      </div>
      
      {/* Logo a la part inferior */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingBottom: '30px' }}>
        <img 
          src="/icon.jpeg" 
          alt="Logo Penya l'Albenc" 
          style={{ 
            height: '500px', 
            width: 'auto', 
            maxWidth: '100%',
            borderRadius: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
          }} 
        />
      </div>
    </div>
  );
}
