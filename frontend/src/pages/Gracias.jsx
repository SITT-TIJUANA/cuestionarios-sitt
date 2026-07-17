import { api } from '../lib/api';
import FondoXiuhcoatl from '../components/FondoXiuhcoatl';

export default function Gracias() {
  const token = sessionStorage.getItem('sesion_token');

  function descargar() {
    window.open(api.urlReporte(token), '_blank');
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
        <button className="boton-sitt" onClick={descargar}>Descargar mi reporte</button>
      </div>
    </>
  );
}
