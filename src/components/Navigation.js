'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navigation() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === 'penyaalbenc@gmail.com') {
        setIsAdmin(true);
      }
    }
    checkUser();
  }, [pathname]);

  if (pathname === '/login' || pathname === '/registre') return null;

  const mainNavItems = [
    { name: 'Inici', path: '/', icon: HomeIcon },
    { name: 'Menjars', path: '/menjades', icon: FoodIcon },
    { name: 'Comptes', path: '/comptes', icon: BanknotesIcon },
    { name: 'Agenda', path: '/agenda', icon: CalendarIcon },
    { name: 'Perfil', path: '/perfil', icon: UserIcon },
  ];

  const moreNavItems = [
    { name: 'Llista Compra', path: '/compra' },
    { name: 'Festes', path: '/festes' },
    { name: 'Manteniment', path: '/manteniment' },
    { name: 'Reunions', path: '/reuniones' },
    { name: 'Notícies', path: '/noticies' },
  ];

  return (
    <>
      <nav className="bottom-nav">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setShowMenu(false)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        <button 
          className={`nav-item ${showMenu ? 'active' : ''}`} 
          onClick={() => setShowMenu(!showMenu)}
          style={{ background: 'transparent' }}
        >
          <MenuIcon />
          <span>Més</span>
        </button>
      </nav>

      {/* Menú Desplegable (Més) */}
      {showMenu && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(var(--nav-height) + 10px)',
          right: '10px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '15px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--glass-border)',
          padding: '10px 0',
          zIndex: 999,
          minWidth: '150px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {moreNavItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setShowMenu(false)}
              style={{
                display: 'block',
                padding: '12px 20px',
                color: pathname === item.path ? 'var(--primary-blue)' : 'var(--text-main)',
                fontWeight: pathname === item.path ? '600' : '400',
                borderBottom: '1px solid var(--border-color)',
                textDecoration: 'none'
              }}
            >
              {item.name}
            </Link>
          ))}
          {isAdmin && (
            <Link 
              href="/admin"
              onClick={() => setShowMenu(false)}
              style={{
                display: 'block',
                padding: '12px 20px',
                color: 'var(--primary-blue-dark)',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              ⚙️ Panell Admin
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function BanknotesIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}
