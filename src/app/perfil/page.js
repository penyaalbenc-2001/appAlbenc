'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getMembreByUserId } from './actions';
import { useLanguage } from '@/context/LanguageContext';

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [membre, setMembre] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      const membreData = await getMembreByUserId(user.id);
      setMembre(membreData);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant perfil...</div>;

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '100px' }}>
      <h1 className="title" style={{ textAlign: 'center' }}>{t('profile.title')}</h1>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '40px', 
          backgroundColor: 'var(--primary-blue)', color: 'white',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '2rem', fontWeight: 'bold'
        }}>
          {membre?.nom ? membre.nom.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{membre?.nom || 'Membre desconegut'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>

        <div style={{ width: '100%', marginTop: '10px' }}>
          <label style={{ fontWeight: '600', marginBottom: '5px', display: 'block', textAlign: 'center' }}>{t('auth.language')}</label>
          <select 
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', textAlign: 'center' }}
          >
            <option value="ca">{t('auth.catalan')}</option>
            <option value="es">{t('auth.spanish')}</option>
          </select>
        </div>

        <button 
          onClick={handleLogout} 
          style={{ 
            marginTop: '10px', padding: '10px 20px', borderRadius: '8px', width: '100%',
            backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5',
            fontWeight: '600'
          }}
        >
          {t('profile.logout')}
        </button>
      </div>

      <div className="card">
        <h3 className="card-title">Activitat recent</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
          Encara no hi ha activitat registrada per la teua part.
        </p>
      </div>
    </div>
  );
}
