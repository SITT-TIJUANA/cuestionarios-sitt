import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Bienvenida() {
  const [cuestionario, setCuestionario] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.cuestionarioActivo()
      .then(setCuestionario)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  async function comenzar() {
    const { token } = await api.crearSesion(cuestionario.id);
    sessionStorage.setItem('sesion_token', token);
    sessionStorage.setItem('cuestionario', JSON.stringify(cuestionario));
    navigate('/responder');
  }

  if (cargando) return <div className="contenedor" />;

  if (error) {
    return (
      <div className="contenedor" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="contenedor" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <p style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
        XXV Ayuntamiento de Tijuana
      </p>

      <svg width="120" height="100" viewBox="0 0 120 100" style={{ margin: '24px 0' }}>
        <line x1="60" y1="14" x2="60" y2="80" stroke="var(--border)" strokeWidth="2" />
        <circle cx="60" cy="12" r="4" fill="var(--gold)" />
        <line x1="20" y1="14" x2="100" y2="14" stroke="var(--border)" strokeWidth="2" />
        <path d="M8 34 A12 12 0 0 0 32 34 Z" fill="none" stroke="var(--guinda)" strokeWidth="2" />
        <path d="M88 34 A12 12 0 0 0 112 34 Z" fill="none" stroke="var(--guinda)" strokeWidth="2" />
        <path d="M46 80 L74 80 L68 88 L52 88 Z" fill="var(--border)" />
        <rect x="40" y="88" width="40" height="6" rx="2" fill="var(--border)" />
      </svg>

      <h1 className="voz" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px' }}>{cuestionario.titulo}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
        {cuestionario.descripcion || 'Tus respuestas son completamente anónimas.'}
      </p>

      <div style={{ display: 'flex', gap: 20, marginBottom: 28, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{cuestionario.tiempo_estimado_min} min</span>
        <span>Anónimo</span>
        <span>Reporte al final</span>
      </div>

      <button className="boton-primario" onClick={comenzar}>Comenzar</button>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>Ética que transforma Tijuana</p>
    </div>
  );
}
