import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function Dashboard() {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', tipo: 'opcion_multiple', tiempo_estimado_min: 3 });
  const navigate = useNavigate();

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
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="opcion_multiple">Opción múltiple (como Test de Ética)</option>
            <option value="escala">Escala 1-10 (como Ética Laboral)</option>
          </select>
          <button className="boton-primario" type="submit">Crear</button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cuestionarios.map((c) => (
          <div key={c.id} className="tarjeta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{c.titulo}</strong>
                {c.activo && <span style={{ fontSize: 11, background: '#E1F5EE', color: 'var(--success)', padding: '2px 8px', borderRadius: 20 }}>Activo</span>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {c.total_preguntas} preguntas · {c.total_respuestas} respuestas
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Link to={`/admin/cuestionarios/${c.id}`} style={{ fontSize: 13, color: 'var(--guinda)' }}>Editar</Link>
              <Link to={`/admin/cuestionarios/${c.id}/estadisticas`} style={{ fontSize: 13, color: 'var(--guinda)' }}>Estadísticas</Link>
              {c.activo
                ? <button onClick={() => desactivar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--text-muted)' }}>Desactivar</button>
                : <button onClick={() => activar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--teal)' }}>Activar</button>}
              <button onClick={() => eliminar(c.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--danger)' }}>Eliminar</button>
            </div>
          </div>
        ))}
        {cuestionarios.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aún no hay cuestionarios. Crea el primero.</p>}
      </div>
    </div>
  );
}
