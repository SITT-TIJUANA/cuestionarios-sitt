import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

function enlaceDe(id) {
  return `${window.location.origin}${import.meta.env.BASE_URL}?c=${id}`;
}

export default function Dashboard() {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [nuevo, setNuevo] = useState(false);
  const [verQr, setVerQr] = useState(null);
  const [copiado, setCopiado] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', tiempo_estimado_min: 3 });
  const navigate = useNavigate();

  function copiarEnlace(id) {
    navigator.clipboard.writeText(enlaceDe(id));
    setCopiado(id);
    setTimeout(() => setCopiado(null), 1500);
  }

  function cargar() { api.listarCuestionarios().then(setCuestionarios); }
  useEffect(cargar, []);

  async function activar(id) { await api.activarCuestionario(id); cargar(); }
  async function desactivar(id) { await api.desactivarCuestionario(id); cargar(); }
  async function eliminar(id) {
    if (!confirm('¿Eliminar este cuestionario y todas sus preguntas y respuestas?')) return;
    await api.eliminarCuestionario(id); cargar();
  }
  async function crear(e) {
    e.preventDefault();
    const c = await api.crearCuestionario(form);
    setNuevo(false);
    navigate(`/admin/cuestionarios/${c.id}`);
  }
  function salir() { localStorage.removeItem('admin_token'); navigate('/admin/login'); }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="voz" style={{ fontSize: 22, margin: 0 }}>Cuestionarios</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="boton-secundario" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setNuevo(!nuevo)}>+ Nuevo</button>
          <button className="boton-secundario" style={{ width: 'auto', padding: '8px 16px' }} onClick={salir}>Salir</button>
        </div>
      </div>

      {nuevo && (
        <form onSubmit={crear} className="tarjeta" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Título" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} />
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} />
          <button className="boton-primario" type="submit">Crear</button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cuestionarios.map((c) => (
          <div key={c.id} className="tarjeta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>{c.titulo}</strong>
                  {c.activo && <span style={{ fontSize: 11, background: '#E1F5EE', color: 'var(--success)', padding: '2px 8px', borderRadius: 20 }}>Activo</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {c.total_preguntas} preguntas · {c.total_respuestas} respuestas
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Link to={`/admin/cuestionarios/${c.id}`} style={{ fontSize: 13, color: 'var(--guinda)' }}>Editar</Link>
                <Link to={`/admin/cuestionarios/${c.id}/estadisticas`} style={{ fontSize: 13, color: 'var(--guinda)' }}>Estadísticas</Link>
                <button onClick={() => setVerQr(verQr === c.id ? null : c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--teal)' }}>
                  {verQr === c.id ? 'Ocultar QR' : 'Ver QR'}
                </button>
                {c.activo
                  ? <button onClick={() => desactivar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--text-muted)' }}>Desactivar</button>
                  : <button onClick={() => activar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--teal)' }}>Activar</button>}
                <button onClick={() => eliminar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--danger)' }}>Eliminar</button>
              </div>
            </div>

            {verQr === c.id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(enlaceDe(c.id))}`}
                  alt={`Código QR de ${c.titulo}`}
                  width={160} height={160}
                  style={{ borderRadius: 8, border: '1px solid var(--border)' }}
                />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px' }}>Enlace directo a este cuestionario</p>
                  <p style={{ fontSize: 13, wordBreak: 'break-all', background: 'var(--cream)', padding: 8, borderRadius: 8, margin: '0 0 8px' }}>
                    {enlaceDe(c.id)}
                  </p>
                  <button className="boton-secundario" style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }} onClick={() => copiarEnlace(c.id)}>
                    {copiado === c.id ? 'Copiado ✓' : 'Copiar enlace'}
                  </button>
                  {!c.activo && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>Este cuestionario está desactivado — actívalo para que el QR funcione.</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {cuestionarios.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aún no hay cuestionarios. Crea el primero.</p>}
      </div>
    </div>
  );
}
