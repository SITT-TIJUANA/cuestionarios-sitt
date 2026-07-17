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
          justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
          minHeight: '100dvh', padding: '48px 24px',
          opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease'
        }}
      >
        <p style={{ fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dorado)', fontWeight: 700, margin: 0 }}>
          XXV Ayuntamiento de Tijuana
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <EscudoTilt />
          <h1 className="voz" style={{ fontSize: 40, fontWeight: 700, margin: 0, color: 'white', lineHeight: 1.15 }}>
            {cuestionario.titulo}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--crema)', lineHeight: 1.6, margin: 0, opacity: 0.9, maxWidth: 340 }}>
            {cuestionario.descripcion || 'Tus respuestas son completamente anónimas.'}
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--crema)', opacity: 0.8 }}>
            <span>{cuestionario.tiempo_estimado_min} min</span>
            <span>Anónimo</span>
            <span>Reporte al final</span>
          </div>
          <BotonSitt onClick={comenzar}>Comenzar</BotonSitt>
          <p style={{ fontSize: 12, color: 'var(--dorado)', margin: 0, opacity: 0.85 }}>Ética que transforma Tijuana</p>
        </div>
      </div>
    </>
  );
}
