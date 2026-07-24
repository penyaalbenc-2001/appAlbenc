'use client';

import { useState, useEffect } from 'react';
import { getEsdeveniments, addEsdeveniment, deleteEsdeveniment, getAllCalendarEvents } from './actions';
import { getMembreByUserId } from '../perfil/actions';
import { supabase } from '@/lib/supabase';

// Helper functions for the calendar
const MESOS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
const DIES_SETMANA = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOfMonth(year, monthIndex) {
  let day = new Date(year, monthIndex, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  return day === 0 ? 6 : day - 1;
}

export default function AgendaPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [esdeveniments, setEsdeveniments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ evento: '', fecha: '', fecha_fin: '', hora: '', ubicacion: '', descripcion: '' });
  const [guardant, setGuardant] = useState(false);
  
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const membre = await getMembreByUserId(user.id);
        if (membre) setMembreNom(membre.nom);
      }
      
      const [eventsList, calEvents] = await Promise.all([
        getEsdeveniments(),
        getAllCalendarEvents()
      ]);
      setEsdeveniments(eventsList);
      setCalendarEvents(calEvents);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setGuardant(true);
    await addEsdeveniment(formData.evento, formData.fecha, formData.fecha_fin, formData.hora, formData.ubicacion, formData.descripcion, membreNom);
    
    const [eventsList, calEvents] = await Promise.all([
      getEsdeveniments(),
      getAllCalendarEvents()
    ]);
    setEsdeveniments(eventsList);
    setCalendarEvents(calEvents);
    
    setFormData({ evento: '', fecha: '', fecha_fin: '', hora: '', ubicacion: '', descripcion: '' });
    setShowForm(false);
    setGuardant(false);
  };

  const handleDelete = async (id, evento) => {
    if (!confirm('Segur que vols eliminar aquest esdeveniment?')) return;
    setEsdeveniments(esdeveniments.filter(e => e.id !== id));
    await deleteEsdeveniment(id, evento, membreNom);
    const calEvents = await getAllCalendarEvents();
    setCalendarEvents(calEvents);
  };

  // Build a map of date string (YYYY-MM-DD) -> Array of events
  const eventsMap = {};
  calendarEvents.forEach(evt => {
    if (evt.date) {
      if (!eventsMap[evt.date]) eventsMap[evt.date] = [];
      eventsMap[evt.date].push(evt);
    }
  });

  const handleMouseEnter = (dateStr) => {
    setHoveredDate(dateStr);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant agenda i calendari...</div>;

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title" style={{ margin: 0 }}>Agenda Anual</h1>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 15px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel·lar' : '+ Nou'}
        </button>
      </div>
      
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Nou Esdeveniment</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Títol (ex: Sopar de Nadal, Cap de setmana...)" value={formData.evento} onChange={e => setFormData({...formData, evento: e.target.value})} required className="form-input" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Data Inici</label>
                <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required className="form-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Data Fi (Opcional)</label>
                <input type="date" value={formData.fecha_fin} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} className="form-input" />
              </div>
            </div>
            <input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} className="form-input" />
            <input type="text" placeholder="Ubicació" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} className="form-input" />
            <textarea placeholder="Descripció..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="form-input" rows={3}></textarea>
            <button type="submit" className="btn-primary" disabled={guardant}>{guardant ? 'Guardant...' : 'Crear Esdeveniment'}</button>
          </form>
          <style jsx>{`
            .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); font-family: inherit; }
          `}</style>
        </div>
      )}

      {/* Calendari Anual */}
      <div className="card" style={{ padding: '20px', backgroundColor: 'white', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
          <button onClick={() => setCurrentYear(y => y - 1)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt;</button>
          
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', border: 'none', background: 'transparent', appearance: 'none', textAlign: 'center', cursor: 'pointer' }}
          >
            {[...Array(10)].map((_, i) => {
              const year = new Date().getFullYear() - 3 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>

          <button onClick={() => setCurrentYear(y => y + 1)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&gt;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {MESOS.map((mesName, monthIndex) => {
            const daysInMonth = getDaysInMonth(currentYear, monthIndex);
            const firstDay = getFirstDayOfMonth(currentYear, monthIndex);
            
            const blankDays = Array(firstDay).fill(null);
            const monthDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
            
            return (
              <div key={mesName} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '16px', color: '#334155' }}>{mesName}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '5px' }}>
                  {DIES_SETMANA.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>{d}</div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                  {blankDays.map((_, i) => <div key={`blank-${i}`} />)}
                  
                  {monthDays.map(day => {
                    const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = eventsMap[dateStr];
                    const hasEvent = dayEvents && dayEvents.length > 0;
                    const isToday = dateStr === todayStr;
                    
                    return (
                      <div 
                        key={day} 
                        onMouseEnter={() => hasEvent && setHoveredDate(dateStr)}
                        onMouseLeave={() => setHoveredDate(null)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          borderRadius: '4px',
                          cursor: hasEvent ? 'pointer' : 'default',
                          backgroundColor: hasEvent ? 'var(--primary-green)' : '#f8fafc',
                          color: hasEvent ? 'white' : (isToday ? 'var(--primary-blue)' : '#64748b'),
                          fontWeight: (hasEvent || isToday) ? 'bold' : 'normal',
                          border: isToday ? '2px solid var(--primary-blue)' : (hasEvent ? 'none' : '1px solid #f1f5f9')
                        }}
                      >
                        {day}
                        
                        {/* Tooltip renderitzat dins del mateix dia */}
                        {hoveredDate === dateStr && hasEvent && (
                          <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 10px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#1e293b',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                            zIndex: 1000,
                            minWidth: '150px',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            textAlign: 'left'
                          }}>
                            {/* Fletxa baix */}
                            <div style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              borderWidth: '6px 6px 0',
                              borderStyle: 'solid',
                              borderColor: '#1e293b transparent transparent transparent'
                            }} />
                            
                            {dayEvents.map((evt, idx) => (
                              <div key={idx} style={{ marginBottom: idx < dayEvents.length - 1 ? '10px' : '0', borderBottom: idx < dayEvents.length - 1 ? '1px solid #475569' : 'none', paddingBottom: idx < dayEvents.length - 1 ? '5px' : '0' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: evt.type === 'comida' ? 'var(--primary-green)' : 'var(--primary-orange)' }}>
                                  {evt.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                                  {evt.time && `🕐 ${evt.time}`} {evt.time && evt.location && '|'} {evt.location && `📍 ${evt.location}`}
                                </div>
                                {evt.description && (
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', maxWidth: '200px', whiteSpace: 'normal' }}>
                                    {evt.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Llista d'esdeveniments històrica avall */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'var(--text-main)' }}>Llistat d'Esdeveniments</h2>
        {esdeveniments.length === 0 ? (
          <div className="card"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>📅 No hi ha cap esdeveniment programat.</p></div>
        ) : (
          esdeveniments.map((e, i) => (
            <div key={e.id || `evt-${i}`} className="card" style={{ borderLeft: '4px solid var(--primary-orange)', position: 'relative', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', paddingRight: '30px' }}>{e.evento}</h3>
              <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>
                📅 {e.fecha} {e.fecha_fin && ` - ${e.fecha_fin}`}
              </p>
              {(e.hora || e.ubicacion) && (
                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                  {e.hora && `🕐 ${e.hora}`} {e.hora && e.ubicacion && '|'} {e.ubicacion && `📍 ${e.ubicacion}`}
                </p>
              )}
              {e.descripcion && (
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '10px', fontSize: '0.95rem' }}>
                  {e.descripcion}
                </div>
              )}
              
              <button 
                onClick={() => handleDelete(e.id, e.evento)}
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
