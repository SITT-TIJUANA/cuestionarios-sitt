import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, descargarBlob } from '../../lib/api';

function IconoResultado({ correcto }) {
  if (correcto === true) return <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16 }}>✓</span>;
  if (correcto === false) return <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 16 }}>✕</span>;
  return <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 16 }}>—</span>;
}

export default function Reportes() {
  const { id } = useParams();
  const [cuestionario, setCuestionario] = useState(null);
  const [modo, setModo] = useState('grupal');
  const [grupal, setGrupal] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [modalSesion, setModalSesion] = useState(null);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    api.listarCuestionarios().then((cs) => setCuestionario(cs.find((c) => String(c.id) === id)));
    api.sesiones(id).then(setSesiones);
  }, [id]);

  useEffect(() => {
    if (modo === 'grupal') api.reporteGrupal(id).then(setGrupal).catch(() => {});
  }, [modo, id]);

  async function abrirModal(sesionId) {
    const datos = await api.reporteIndividual(sesionId);
    setModalSesion(datos);
  }

  async function descargarIndividual(sesionId) {
    setGenerando(true);
    try {
      const blob = await api.reporteIndividualPdf(sesionId);
      descargarBlob(blob, `reporte-individual-${sesionId}.pdf`);
    } finally {
      setGenerando(false);
    }
  }

  async function descargarGrupal() {
    setGenerando(true);
    try {
      const blob = await api.reporteGrupalPdf(id);
      descargarBlob(blob, `reporte-grupal-${cuestionario.titulo}.pdf`);
    } finally {
      setGenerando(false);
    }
  }

  if (!cuestionario) return null;

  const colorIndicador = (pct) => pct == null ? 'var(--text-muted)' : pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--dorado)' : 'var(--danger)';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <Link to="/admin" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Volver</Link>
      <h1 className="voz" style={{ fontSize: 22, margin: '8px 0 4px' }}>Reportes · {cuestionario.titulo}</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Indicador SITT: qué tan alineadas están las respuestas al Código de Ética.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setModo('grupal')}
          className={modo === 'grupal' ? 'boton-primario' : 'boton-secundario'}
          style={{ width: 'auto', padding: '8px 18px' }}
        >Reporte grupal</button>
        <button
          onClick={() => setModo('individual')}
          className={modo === 'individual' ? 'boton-primario' : 'boton-secundario'}
          style={{ width: 'auto', padding: '8px 18px' }}
        >Reporte individual</button>
      </div>

      {modo === 'grupal' && (
        <>
          {!grupal ? <p style={{ color: 'var(--text-muted)' }}>Cargando…</p> : (
            <>
              <div className="tarjeta" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 84, height: 84, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `6px solid ${colorIndicador(grupal.indicador)}`, flexShrink: 0
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: colorIndicador(grupal.indicador) }}>
                    {grupal.indicador == null ? '—' : `${grupal.indicador}%`}
                  </span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Indicador SITT de ética</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                    {grupal.total_sesiones} personas contestaron · {grupal.aciertos} de {grupal.calificables} respuestas correctas
                  </p>
                </div>
              </div>

              <button className="boton-primario" style={{ marginBottom: 20 }} onClick={descargarGrupal} disabled={generando}>
                {generando ? 'Generando…' : 'Generar PDF grupal'}
              </button>

              <h3 style={{ fontSize: 15 }}>Resultado por pregunta</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grupal.por_pregunta.map((p) => {
                  const total = p.aciertos + p.incorrectos;
                  const pct = total > 0 ? Math.round((p.aciertos / total) * 100) : null;
                  return (
                    <div key={p.pregunta_id} className="tarjeta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {p.imagen_url && <img src={p.imagen_url} alt="" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600 }}>{p.orden}. {p.pregunta}</p>
                        {pct !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: colorIndicador(pct) }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: colorIndicador(pct) }}>{pct}%</span>
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{p.respuestas} respuestas · no calificable</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {modo === 'individual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sesiones.map((s, i) => (
            <div key={s.id} className="tarjeta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13 }}>Respuesta #{i + 1} · {new Date(s.completado_en).toLocaleDateString('es-MX')}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => abrirModal(s.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--guinda)' }}>Ver detalle</button>
                <button onClick={() => descargarIndividual(s.id)} disabled={generando} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--teal)' }}>PDF</button>
              </div>
            </div>
          ))}
          {sesiones.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Todavía no hay respuestas.</p>}
        </div>
      )}

      {modalSesion && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50
        }} onClick={() => setModalSesion(null)}>
          <div className="tarjeta" style={{ maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', background: 'white' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong style={{ fontSize: 15 }}>Detalle de respuesta</strong>
              <button onClick={() => setModalSesion(null)} style={{ background: 'none', border: 'none', fontSize: 18 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--guinda)', fontWeight: 600, marginBottom: 16 }}>
              Aciertos: {modalSesion.resumen.aciertos} de {modalSesion.resumen.calificables} calificables
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modalSesion.filas.map((f) => (
                <div key={f.pregunta_id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                  {f.imagen_url && <img src={f.imagen_url} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>{f.orden}. {f.pregunta}</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{f.respuesta}</p>
                  </div>
                  <IconoResultado correcto={f.correcto} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
