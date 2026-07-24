'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getMembreByUserId } from '@/app/perfil/actions';
import { getAllMembres } from '@/app/menjades/actions';
import { getReuniones, saveReunion, deleteReunion } from './actions';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ReunionesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [membreNom, setMembreNom] = useState('Algú');
  const [membres, setMembres] = useState([]);
  const [reuniones, setReuniones] = useState([]);
  
  const [activeReunion, setActiveReunion] = useState(null); // null means list view, object means edit/create view
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ id: null, fecha: '', asistentes: [], estado: 'programada' });
  const [puntos, setPuntos] = useState(['']);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const m = await getMembreByUserId(user.id);
        if (m) setMembreNom(m.nom);

        const fetchedReuniones = await getReuniones();
        setReuniones(fetchedReuniones);
        
        const fetchedMembres = await getAllMembres();
        setMembres(fetchedMembres);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleNew = () => {
    setFormData({ id: null, fecha: new Date().toISOString().split('T')[0], asistentes: [], estado: 'programada' });
    setPuntos(['']);
    setActiveReunion({});
    setError(null);
  };

  const handleEdit = (r) => {
    // Convert comma string to array for checkboxes
    const asisArray = r.asistentes ? r.asistentes.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    // Parse puntos
    let parsedPuntos = [];
    try {
      parsedPuntos = JSON.parse(r.temas);
    } catch {
      parsedPuntos = r.temas ? [r.temas] : [];
    }
    if (!Array.isArray(parsedPuntos) || parsedPuntos.length === 0) parsedPuntos = [''];

    setFormData({ id: r.id, fecha: r.fecha, asistentes: asisArray, estado: r.estado || 'programada' });
    setPuntos(parsedPuntos);
    setActiveReunion(r);
    setError(null);
  };

  const handleToggleAsistente = (nom) => {
    setFormData(prev => {
      const isSelected = prev.asistentes.includes(nom);
      if (isSelected) {
        return { ...prev, asistentes: prev.asistentes.filter(n => n !== nom) };
      } else {
        return { ...prev, asistentes: [...prev.asistentes, nom] };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.fecha) {
      setError("La data és obligatòria.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const asisString = formData.asistentes.join(', ');
      const temasString = JSON.stringify(puntos.filter(p => p.trim() !== ''));
      await saveReunion(formData.id, formData.fecha, temasString, asisString, formData.estado, membreNom);
      const refreshed = await getReuniones();
      setReuniones(refreshed);
      setActiveReunion(null);
    } catch (err) {
      console.error(err);
      setError("Error al guardar la reunió.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Segur que vols eliminar aquesta acta?')) return;
    try {
      await deleteReunion(id, membreNom);
      setReuniones(reuniones.filter(r => r.id !== id));
      setActiveReunion(null);
    } catch (err) {
      console.error(err);
      setError("Error al eliminar.");
    }
  };

  const handleExportPDF = async (reunion) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      let parsedPuntos = [];
      try { parsedPuntos = JSON.parse(reunion.temas); } 
      catch { parsedPuntos = reunion.temas ? [reunion.temas] : []; }

      const puntosHTML = parsedPuntos.length > 0 
        ? `<h3 style="color: #ea580c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 0;">Punts Tractats</h3>
           <ol style="padding-left: 20px; font-size: 16px;">
             ${parsedPuntos.map(p => `<li style="margin-bottom: 12px; padding-left: 5px;">${p}</li>`).join('')}
           </ol>`
        : '<p>Sense punts registrats.</p>';

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px;">
            <div>
              <h1 style="margin: 0; color: #ea580c; font-size: 28px;">Acta de Reunió</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px; color: #64748b;">Penya Albenc</p>
            </div>
            <img src="/icon.jpeg" style="height: 70px; border-radius: 12px; object-fit: contain;" />
          </div>
          
          <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Data:</strong> ${reunion.fecha}</p>
            <p style="margin: 0; line-height: 1.5;"><strong>👥 Assistents:</strong> ${reunion.asistentes || 'Cap'}</p>
          </div>
          
          <div style="line-height: 1.6; color: #334155;">
            ${puntosHTML}
          </div>
        </div>
      `;
      
      const opt = {
        margin:       10,
        filename:     `Acta_Reunio_${reunion.fecha}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert("Error al generar el PDF. Comprova la teua connexió.");
    }
  };

  const handleUpdatePunto = (index, val) => {
    const newPuntos = [...puntos];
    newPuntos[index] = val;
    setPuntos(newPuntos);
  };

  const handleAddPunto = () => {
    setPuntos([...puntos, '']);
  };

  const handleRemovePunto = (index) => {
    const newPuntos = puntos.filter((_, i) => i !== index);
    if (newPuntos.length === 0) newPuntos.push('');
    setPuntos(newPuntos);
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) return <div className="container" style={{marginTop: '50px', textAlign: 'center'}}>Carregant reunions...</div>;

  return (
    <div className="container" style={{ padding: '20px', paddingBottom: '100px' }}>
      {!activeReunion ? (
        // LLISTA DE REUNIONS
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              ← Inici
            </button>
            <button onClick={handleNew} className="btn-primary" style={{ padding: '8px 16px', width: 'auto', backgroundColor: 'var(--primary-orange)', borderColor: 'var(--primary-orange)' }}>
              ➕ Nova Reunió
            </button>
          </div>
          
          <h1 className="title" style={{ marginBottom: '10px' }}>🤝 Actes i Reunions</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Ací guardem tot allò que es parla. Pots exportar-ho a PDF quan vullgues.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reuniones.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '30px' }}>Encara no hi ha cap acta registrada.</p>
            ) : (
              reuniones.map((r, index) => (
                <div key={r.id || `reunion-${index}`} className="card" style={{ padding: '15px', borderLeft: r.estado === 'finalizada' ? '4px solid var(--primary-green)' : '4px solid var(--primary-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{r.fecha}</h3>
                      <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {r.estado === 'finalizada' ? '✅ Finalitzada' : '📅 Programada'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleExportPDF(r)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        📄 PDF
                      </button>
                      <button onClick={() => handleEdit(r)} style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✏️ Obrir
                      </button>
                    </div>
                  </div>
                  {r.asistentes && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
                      <strong>👥 Assistents:</strong> {r.asistentes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // EDITOR DE REUNIÓ
        <div className="fade-in">
          <button onClick={() => setActiveReunion(null)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>
            ← Tornar a la llista
          </button>
          
          <h1 className="title" style={{ marginBottom: '20px' }}>{formData.id ? '✏️ Editar Acta' : '📝 Nova Acta'}</h1>

          {error && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Data de la Reunió</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.fecha} 
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})} 
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Estat</label>
                  <select 
                    className="form-input" 
                    value={formData.estado} 
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="programada">📅 Programada</option>
                    <option value="finalizada">✅ Finalitzada</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '15px' }}>👥 Assistents</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {membres.map(m => {
                  const isSelected = formData.asistentes.includes(m.nom);
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => handleToggleAsistente(m.nom)}
                      style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: isSelected ? '2px solid var(--primary-green)' : '1px solid #cbd5e1', 
                        background: isSelected ? '#ecfdf5' : 'white', 
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m.nom}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.2rem', color: 'var(--primary-blue)' }}>📝 Punts a tractar</label>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Afig cada tema en un requadre distint per a que l'acta s'exporte perfectament ordenada i numerada.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {puntos.map((punto, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      background: 'var(--primary-blue)', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '28px', 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginTop: '10px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flexGrow: 1, backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                      <ReactQuill 
                        theme="snow" 
                        value={punto}
                        onChange={(val) => handleUpdatePunto(index, val)}
                        modules={modules}
                        placeholder={`Escriu el punt número ${index + 1} (pots afegir fotos o enllaços)...`}
                        style={{ minHeight: '80px' }}
                      />
                    </div>
                    <button 
                      onClick={() => handleRemovePunto(index)}
                      style={{ 
                        background: '#fef2f2', 
                        color: '#ef4444', 
                        border: '1px solid #fca5a5', 
                        borderRadius: '6px', 
                        padding: '10px', 
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                      title="Llevar punt"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleAddPunto}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  color: 'var(--primary-blue)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ➕ Afegir altre punt a tractar
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="btn-primary" 
                style={{ flex: 2, padding: '15px', fontSize: '1.1rem', backgroundColor: 'var(--primary-green)', borderColor: 'var(--primary-green)' }}
              >
                {saving ? 'Guardant...' : '💾 Guardar Acta'}
              </button>
              
              {formData.id && (
                <button 
                  onClick={() => handleDelete(formData.id)} 
                  disabled={saving}
                  style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '2px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🗑️ Esborrar
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .form-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: white; font-size: 1rem; }
      `}</style>
    </div>
  );
}
