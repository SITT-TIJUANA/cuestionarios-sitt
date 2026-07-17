import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FondoXiuhcoatl from '../components/FondoXiuhcoatl';
import BotonSitt from '../components/BotonSitt';

export default function Gracias() {
  const token = sessionStorage.getItem('sesion_token');
  const navigate = useNavigate();

  function descargar() {
    window.open(api.urlReporte(token), '_blank');
  }

  function volverAlInicio() {
    sessionStorage.removeItem('sesion_token');
    navigate('/', { replace: true });
  }

  function cerrar() {
    window.close();
    // Si el navegador no permite cerrar la pestaña (no fue abierta por script),
    // igual dejamos al usuario en la pantalla de inicio.
    setTimeout(volverAlInicio, 300);
  }

  return (
    <>
      <FondoXiuhcoatl />
      <div className="contenedor" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'var(--verde)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 28, color: 'white'
        }}>✓</div>
        <h1 className="voz" style={{ fontSize: 24, margin: '0 0 8px', color: 'white' }}>Gracias por participar</h1>
        <p style={{ fontSize: 14, color: 'var(--crema)', marginBottom: 28, lineHeight: 1.6, opacity: 0.85 }}>
          Tu respuesta quedó registrada de forma anónima.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BotonSitt onClick={descargar}>Descargar a mi celular</BotonSitt>
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
