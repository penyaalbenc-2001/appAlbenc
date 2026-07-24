'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <h1 className="title" style={{ textAlign: 'center' }}>Inicia Sessió</h1>
      <div className="card">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {error && <div style={{ color: 'red', fontSize: '0.9rem' }}>{error}</div>}
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
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Entrant...' : 'Entrar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          No tens compte? <Link href="/registre" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>Registra't</Link>
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
