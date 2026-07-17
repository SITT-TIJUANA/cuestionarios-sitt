import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { api } from '../../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Estadisticas() {
  const { id } = useParams();
  const [resumen, setResumen] = useState(null);
  const [porPregunta, setPorPregunta] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [libres, setLibres] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    api.resumen(id).then(setResumen);
    api.sesiones(id).then(setSesiones);
    api.porPregunta(id).then(setPorPregunta).catch(() => {});
    api.promedios(id).then(setPromedios).catch(() => {});
    api.libres(id).then(setLibres).catch(() => {});
  }, [id]);

  if (!resumen) return null;

  const preguntasAgrupadas = {};
  for (const fila of porPregunta) {
    if (!preguntasAgrupadas[fila.pregunta_id]) preguntasAgrupadas[fila.pregunta_id] = { pregunta: fila.pregunta, filas: [] };
    preguntasAgrupadas[fila.pregunta_id].filas.push(fila);
  }

  const hayContenido = porPregunta.length > 0 || promedios.length > 0 || libres.length > 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <Link to="/admin" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Volver</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 20px' }}>
        <h1 className="voz" style={{ fontSize: 22, margin: 0 }}>Estadísticas</h1>
        <a href={api.urlExportar(id)} className="boton-secundario" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none' }}>Exportar CSV</a>
      </div>

      <div className="tarjeta" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Total de respuestas</p>
        <p style={{ fontSize: 32, fontWeight: 600, margin: '4px 0 0', color: 'var(--guinda)' }}>{resumen.total_respuestas}</p>
      </div>

      {promedios.length > 0 && (
        <div className="tarjeta" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginTop: 0 }}>Promedio por valor (escala)</h3>
          <Bar
            data={{
              labels: promedios.map((p) => p.valor),
              datasets: [{ label: 'Promedio', data: promedios.map((p) => p.promedio), backgroundColor: '#C9A84C' }]
            }}
            options={{ indexAxis: 'y', scales: { x: { min: 0, max: 10 } }, plugins: { legend: { display: false } } }}
          />
        </div>
      )}

      {Object.values(preguntasAgrupadas).map((p, i) => (
        <div key={i} className="tarjeta" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{p.pregunta}</p>
          <Bar
            data={{
              labels: p.filas.map((f) => f.letra),
              datasets: [{ label: 'Respuestas', data: p.filas.map((f) => Number(f.total)), backgroundColor: '#7B1D1D' }]
            }}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
          />
        </div>
      ))}

      {libres.map((p, i) => (
        <div key={i} className="tarjeta" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{p.pregunta}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
            {p.respuestas.map((r, j) => (
              <p key={j} style={{ fontSize: 13, margin: 0, padding: 8, background: 'var(--cream)', borderRadius: 8 }}>"{r}"</p>
            ))}
          </div>
        </div>
      ))}

      {!hayContenido && <p style={{ color: 'var(--text-muted)' }}>Todavía no hay respuestas para mostrar estadísticas.</p>}

      <h3 style={{ fontSize: 15, marginTop: 24 }}>Reportes individuales ({sesiones.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sesiones.map((s, i) => (
          <div key={s.id} className="tarjeta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>Respuesta #{i + 1} · {new Date(s.completado_en).toLocaleDateString('es-MX')}</span>
            <button onClick={() => api.detalleSesion(s.id).then(setDetalle)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--guinda)' }}>Ver detalle</button>
          </div>
        ))}
      </div>

      {detalle && (
        <div className="tarjeta" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 14 }}>Detalle de respuesta</strong>
            <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none' }}>×</button>
          </div>
          {detalle.map((f, i) => (
            <p key={i} style={{ fontSize: 13, margin: '8px 0' }}>
              <strong>{f.pregunta}:</strong> {f.respuesta ?? f.valor_escala ?? f.texto_respuesta}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
