import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FondoGuinda from '../components/FondoGuinda';
import BotonSitt from '../components/BotonSitt';
import { generarImagenCertificado } from '../lib/generarCertificado';

export default function Gracias() {
  const token = sessionStorage.getItem('sesion_token');
  const navigate = useNavigate();
  const [generando, setGenerando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  async function generarReporte() {
    setGenerando(true);
    try {
      const datos = await api.datosReporte(token);
      const blob = await generarImagenCertificado(datos);
      setVistaPrevia(URL.createObjectURL(blob));
    } catch {
      alert('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setGenerando(false);
    }
  }

  function cerrarVistaPrevia() {
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    setVistaPrevia(null);
  }

  function volverAlInicio() {
    sessionStorage.removeItem('sesion_token');
    navigate('/', { replace: true });
  }

  function cerrar() {
    window.close();
    setTimeout(volverAlInicio, 300);
  }

  if (vistaPrevia) {
    return (
      <>
        <FondoGuinda />
        <div className="contenedor" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--crema)', marginBottom: 14, textAlign: 'center', lineHeight: 1.6 }}>
            Mantén presionada la imagen y elige <strong>"Guardar imagen"</strong> para llevártela a tu galería.
          </p>
          <img
            src={vistaPrevia}
            alt="Tu reconocimiento de participación"
            style={{ width: '100%', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', marginBottom: 20 }}
          />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href={vistaPrevia}
              download="reconocimiento-etica.png"
              className="boton-uiverse"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              Guardar imagen
            </a>
            <button className="boton-secundario" style={{ borderColor: 'var(--crema)', color: 'var(--crema)' }} onClick={cerrarVistaPrevia}>
              Cerrar vista previa
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FondoGuinda />
      <div className="contenedor" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid var(--dorado)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, fontSize: 26, color: 'var(--dorado)'
        }}>✓</div>

        <h1 className="voz" style={{ fontSize: 24, margin: '0 0 14px', color: 'white' }}>Gracias por tu tiempo</h1>
        <p style={{ fontSize: 14, color: 'var(--crema)', marginBottom: 8, lineHeight: 1.7, opacity: 0.9 }}>
          Cada respuesta que nos compartes fortalece la confianza de la ciudadanía
          en el servicio público de Tijuana. Detrás de este cuestionario hay un equipo
          que cree en construir, todos los días, un ayuntamiento más íntegro.
        </p>
        <p style={{ fontSize: 14, color: 'var(--dorado)', marginBottom: 30, fontWeight: 600 }}>
          Gracias por ser parte de ese cambio.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BotonSitt onClick={generarReporte} disabled={generando}>
            {generando ? 'Generando…' : 'Descargar mi reporte'}
          </BotonSitt>
          <button className="boton-secundario" style={{ borderColor: 'var(--crema)', color: 'var(--crema)' }} onClick={volverAlInicio}>
            Volver al inicio
          </button>
          <button onClick={cerrar} style={{ background: 'none', border: 'none', color: 'var(--crema)', opacity: 0.6, fontSize: 13, padding: 8 }}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
