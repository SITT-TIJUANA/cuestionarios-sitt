import { api } from '../lib/api';

export default function Gracias() {
  const token = sessionStorage.getItem('sesion_token');

  function descargar() {
    window.open(api.urlReporte(token), '_blank');
  }

  return (
    <div className="contenedor" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: '#E1F5EE',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 28
      }}>✓</div>
      <h1 className="voz" style={{ fontSize: 24, margin: '0 0 8px' }}>Gracias por participar</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
        Tu respuesta quedó registrada de forma anónima.
      </p>
      <button className="boton-primario" onClick={descargar}>Descargar mi reporte</button>
    </div>
  );
}
