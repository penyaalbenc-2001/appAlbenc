'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import ca from '../locales/ca.json';
import es from '../locales/es.json';
import { supabase } from '@/lib/supabase';

const LanguageContext = createContext();

const translations = {
  ca,
  es,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ca');
  const [loading, setLoading] = useState(true);

  // Funcio per llegir de forma segura valors imbricats
  const getNestedTranslation = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  };

  const t = (key) => {
    const translation = getNestedTranslation(translations[language], key);
    return translation || key; // Retorna la clau si no hi ha traducció
  };

  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check local API/db to get the user's language preference
          const res = await fetch('/api/user-language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.idioma) {
              setLanguage(data.idioma);
            }
          }
        } else {
          // Check local storage if not logged in
          const savedLang = localStorage.getItem('language');
          if (savedLang) setLanguage(savedLang);
        }
      } catch (error) {
        console.error('Error loading language', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserLanguage();
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    
    // Update in backend if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetch('/api/user-language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, idioma: newLang }),
      });
    }
  };

  if (loading) return null; // Or a loading spinner

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
