import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Marca from '../components/Marca';
import BotonSitt from '../components/BotonSitt';

export default function Cuestionario() {
  const [cuestionario] = useState(() => JSON.parse(sessionStorage.getItem('cuestionario') || 'null'));
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('sesion_token');

  const variantes = useMemo(
    () => (cuestionario ? cuestionario.preguntas.map(() => Math.floor(Math.random() * 3)) : []),
    [cuestionario]
  );

  useEffect(() => {
    if (!cuestionario || !token) navigate('/');
  }, []);

  if (!cuestionario) return null;

  const pregunta = cuestionario.preguntas[indice];
  const esUltima = indice === cuestionario.preguntas.length - 1;
  const valorActual = respuestas[pregunta.id];

  async function elegir(valor) {
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }));
    const body = cuestionario.tipo === 'opcion_multiple'
      ? { token, pregunta_id: pregunta.id, opcion_id: valor }
      : { token, pregunta_id: pregunta.id, valor_escala: valor };
    api.guardarRespuesta(body).catch(() => {});
  }

  async function siguiente() {
    if (esUltima) {
      setEnviando(true);
      await api.completarSesion(token);
      sessionStorage.removeItem('cuestionario');
      navigate('/gracias', { replace: true });
    } else {
      setIndice((i) => i + 1);
    }
  }

  return (
    <div className="contenedor">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {indice > 0 && (
          <button onClick={() => setIndice((i) => i - 1)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--guinda)' }}>←</button>
        )}
        <div className="barra-progreso" style={{ flex: 1 }}>
          <div className="barra-progreso-relleno" style={{ width: `${((indice + 1) / cuestionario.preguntas.length) * 100}%` }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 40, textAlign: 'right' }}>
          {indice + 1}/{cuestionario.preguntas.length}
        </span>
      </div>

      {pregunta.imagen_url && (
        <img src={pregunta.imagen_url} alt="" style={{ width: '100%', borderRadius: 14, marginBottom: 16, aspectRatio: '4/3', objectFit: 'cover' }} />
      )}

      <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, margin: '0 0 20px' }}>{pregunta.texto}</h2>

      {cuestionario.tipo === 'opcion_multiple' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pregunta.opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => elegir(op.id)}
              className="tarjeta"
              style={{
                textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center',
                borderColor: valorActual === op.id ? 'var(--guinda)' : 'var(--border)',
                background: valorActual === op.id ? '#FAF1EC' : 'white'
              }}
            >
              <Marca variante={variantes[indice]} activa={valorActual === op.id} />
              <span>{op.texto}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px 4px' }}>
          <input
            type="range" min="1" max="10" step="1"
            value={valorActual || 5}
            onChange={(e) => elegir(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 600, color: 'var(--guinda)', marginTop: 12 }}>
            {valorActual || 5}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 20 }}>
        <BotonSitt
          disabled={cuestionario.tipo === 'opcion_multiple' && !valorActual || enviando}
          onClick={siguiente}
        >
          {esUltima ? 'Finalizar' : 'Siguiente'}
        </BotonSitt>
      </div>
    </div>
  );
}
