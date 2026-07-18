import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, EyeOff, FileCheck2, Maximize, Minimize } from 'lucide-react';
import { api } from '../lib/api';
import FondoXiuhcoatl from '../components/FondoXiuhcoatl';
import EscudoTilt from '../components/EscudoTilt';
import BotonSitt from '../components/BotonSitt';

function usarPantallaCompleta() {
  const [soportado] = useState(() =>
    typeof document !== 'undefined' &&
    !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)
  );
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    const detectar = () => setActiva(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', detectar);
    document.addEventListener('webkitfullscreenchange', detectar);
    return () => {
      document.removeEventListener('fullscreenchange', detectar);
      document.removeEventListener('webkitfullscreenchange', detectar);
    };
  }, []);

  function alternar() {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el).catch(() => {});
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch(() => {});
    }
  }

  return { soportado, activa, alternar };
}

export default function Bienvenida() {
  const [cuestionario, setCuestionario] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const pantallaCompleta = usarPantallaCompleta();

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

      {pantallaCompleta.soportado && (
        <button
          onClick={pantallaCompleta.alternar}
          aria-label="Pantalla completa"
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 20,
            width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(192,162,82,0.4)',
            background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {pantallaCompleta.activa
            ? <Minimize size={17} color="var(--dorado)" />
            : <Maximize size={17} color="var(--dorado)" />}
        </button>
      )}

      <div
        style={{
          minHeight: '100svh', width: '100%', maxWidth: 480, margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'center', boxSizing: 'border-box',
          padding: 'clamp(24px, 6vh, 48px) clamp(20px, 6vw, 36px)',
          opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease'
        }}
      >
        <p style={{
          fontSize: 'clamp(13px, 3.6vw, 16px)', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--dorado)', fontWeight: 700, margin: 0
        }}>
          XXV Ayuntamiento de Tijuana
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(18px, 4vh, 32px)' }}>
          <div style={{ width: 'min(300px, 58vw)' }}>
            <EscudoTilt />
          </div>
          <h1 className="voz" style={{
            fontSize: 'clamp(32px, 10vw, 54px)', fontWeight: 700, margin: 0,
            color: 'white', lineHeight: 1.08, letterSpacing: '-0.01em'
          }}>
            {cuestionario.titulo}
          </h1>
          <p style={{
            fontSize: 'clamp(15px, 4.2vw, 19px)', color: 'var(--crema)', lineHeight: 1.6,
            margin: 0, opacity: 0.92, maxWidth: 360
          }}>
            {cuestionario.descripcion || 'Tus respuestas son completamente anónimas.'}
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(22px, 5vh, 36px)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', justifyContent: 'center', width: '100%' }}>
            {[
              { icono: Clock, texto: `${cuestionario.tiempo_estimado_min} min` },
              { icono: EyeOff, texto: 'Anónimo' },
              { icono: FileCheck2, texto: 'Reporte' }
            ].map(({ icono: Icono, texto }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(192,162,82,0.4)',
                borderRadius: 999, padding: 'clamp(7px, 2vw, 9px) clamp(10px, 3vw, 16px)', flexShrink: 0
              }}>
                <Icono size={15} color="var(--dorado)" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: 'white', fontWeight: 500, whiteSpace: 'nowrap' }}>{texto}</span>
              </div>
            ))}
          </div>

          <BotonSitt onClick={comenzar}>Comenzar</BotonSitt>
          <p style={{ fontSize: 12, color: 'var(--dorado)', margin: 0, opacity: 0.85 }}>Ética que transforma Tijuana</p>
        </div>
      </div>
    </>
  );
}
