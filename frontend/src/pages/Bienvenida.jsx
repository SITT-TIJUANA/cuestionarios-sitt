import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FondoXiuhcoatl from '../components/FondoXiuhcoatl';
import EscudoTilt from '../components/EscudoTilt';
import BotonSitt from '../components/BotonSitt';

export default function Bienvenida() {
  const [cuestionario, setCuestionario] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const idParam = new URLSearchParams(window.location.search).get('c');
    const promesa = idParam ? api.cuestionarioPorId(idParam) : api.cuestionarioActivo();
    promesa
      .then((c) => { setCuestionario(c); setTimeout(() => setVisible(true), 80); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  async function comenzar() {
    const idParam = new URLSearchParams(window.location.search).get('c');
    const { token } = await api.crearSesion(idParam || cuestionario.id);
    sessionStorage.setItem('sesion_token', token);
    sessionStorage.setItem('cuestionario', JSON.stringify(cuestionario));
    navigate('/responder');
  }

  if (cargando) {
    return (
      <>
        <FondoXiuhcoatl />
        <div className="contenedor" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <FondoXiuhcoatl />
        <div className="contenedor" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <p style={{ color: 'var(--crema)' }}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <FondoXiuhcoatl />
      <div
        className="contenedor"
        style={{
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease'
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dorado)', fontWeight: 600, marginBottom: 24 }}>
          XXV Ayuntamiento de Tijuana
        </p>

        <EscudoTilt />

        <h1 className="voz" style={{ fontSize: 26, fontWeight: 700, margin: '24px 0 8px', color: 'white' }}>
          {cuestionario.titulo}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--crema)', lineHeight: 1.6, margin: '0 0 24px', opacity: 0.85 }}>
          {cuestionario.descripcion || 'Tus respuestas son completamente anónimas.'}
        </p>

        <div style={{ display: 'flex', gap: 20, marginBottom: 32, fontSize: 12, color: 'var(--crema)', opacity: 0.75 }}>
          <span>{cuestionario.tiempo_estimado_min} min</span>
          <span>Anónimo</span>
          <span>Reporte al final</span>
        </div>

        <BotonSitt onClick={comenzar}>Comenzar</BotonSitt>
        <p style={{ fontSize: 11, color: 'var(--dorado)', marginTop: 20, opacity: 0.8 }}>Ética que transforma Tijuana</p>
      </div>
    </>
  );
}
