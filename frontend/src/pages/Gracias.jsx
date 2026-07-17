import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FondoGuinda from '../components/FondoGuinda';
import BotonSitt from '../components/BotonSitt';
import { generarImagenCertificado } from '../lib/generarCertificado';

export default function Gracias() {
  const token = sessionStorage.getItem('sesion_token');
  const navigate = useNavigate();
  const [descargando, setDescargando] = useState(false);
  const [aviso, setAviso] = useState('');

  async function descargarReporte() {
    setDescargando(true);
    setAviso('');
    try {
      const datos = await api.datosReporte(token);
      const blob = await generarImagenCertificado(datos);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reconocimiento-etica.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setAviso('Listo — revisa tus descargas. En Android suele guardarse directo en la galería; en iPhone queda en la app Archivos (mantén presionada la imagen y elige "Agregar a Fotos").');
    } catch {
      setAviso('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setDescargando(false);
    }
  }

  function volverAlInicio() {
    sessionStorage.removeItem('sesion_token');
    navigate('/', { replace: true });
  }

  function cerrar() {
    window.close();
    setTimeout(volverAlInicio, 300);
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
          <BotonSitt onClick={descargarReporte} disabled={descargando}>
            {descargando ? 'Generando…' : 'Descargar mi reporte'}
          </BotonSitt>
          {aviso && <p style={{ fontSize: 12, color: 'var(--crema)', opacity: 0.85, lineHeight: 1.5 }}>{aviso}</p>}
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
