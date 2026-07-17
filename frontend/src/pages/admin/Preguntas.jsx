import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

const vacio = { texto: '', opciones: [{ letra: 'A', texto: '', es_correcta: false }, { letra: 'B', texto: '', es_correcta: false }, { letra: 'C', texto: '', es_correcta: false }] };

export default function Preguntas() {
  const { id } = useParams();
  const [cuestionario, setCuestionario] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(vacio);
  const [imagen, setImagen] = useState(null);

  function cargar() {
    api.listarCuestionarios().then((cs) => setCuestionario(cs.find((c) => String(c.id) === id)));
    api.listarPreguntas(id).then(setPreguntas);
  }
  useEffect(cargar, [id]);

  function abrirNueva() {
    setForm(cuestionario?.tipo === 'escala' ? { texto: '', opciones: [] } : vacio);
    setImagen(null);
    setEditando('nueva');
  }
  function abrirEditar(p) {
    setForm({ texto: p.texto, opciones: p.opciones.map((o) => ({ letra: o.letra, texto: o.texto, es_correcta: o.es_correcta })) });
    setImagen(null);
    setEditando(p.id);
  }

  async function guardar(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('cuestionario_id', id);
    fd.append('texto', form.texto);
    fd.append('orden', preguntas.length);
    if (cuestionario?.tipo === 'opcion_multiple') fd.append('opciones', JSON.stringify(form.opciones));
    if (imagen) fd.append('imagen', imagen);

    if (editando === 'nueva') await api.crearPregunta(fd);
    else await api.editarPregunta(editando, fd);

    setEditando(null);
    cargar();
  }

  async function eliminar(pid) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await api.eliminarPregunta(pid);
    cargar();
  }

  if (!cuestionario) return null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <Link to="/admin" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Volver</Link>
      <h1 className="voz" style={{ fontSize: 22, margin: '8px 0 20px' }}>{cuestionario.titulo}</h1>

      <button className="boton-secundario" style={{ width: 'auto', padding: '8px 16px', marginBottom: 16 }} onClick={abrirNueva}>+ Agregar pregunta</button>

      {editando && (
        <form onSubmit={guardar} className="tarjeta" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea placeholder="Texto de la pregunta" required value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', minHeight: 60 }} />
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />

          {cuestionario.tipo === 'opcion_multiple' && form.opciones.map((op, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong>{op.letra}</strong>
              <input placeholder={`Opción ${op.letra}`} required value={op.texto}
                onChange={(e) => {
                  const opciones = [...form.opciones];
                  opciones[i] = { ...opciones[i], texto: e.target.value };
                  setForm({ ...form, opciones });
                }}
                style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--border)' }} />
              <label style={{ fontSize: 12, display: 'flex', gap: 4, alignItems: 'center' }}>
                <input type="checkbox" checked={op.es_correcta}
                  onChange={(e) => {
                    const opciones = form.opciones.map((o, j) => ({ ...o, es_correcta: j === i ? e.target.checked : false }));
                    setForm({ ...form, opciones });
                  }} /> Correcta
              </label>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="boton-primario" type="submit">Guardar</button>
            <button type="button" className="boton-secundario" onClick={() => setEditando(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {preguntas.map((p, i) => (
          <div key={p.id} className="tarjeta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {p.imagen_url && <img src={p.imagen_url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14 }}>{i + 1}. {p.texto}</p>
            </div>
            <button onClick={() => abrirEditar(p)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--guinda)' }}>Editar</button>
            <button onClick={() => eliminar(p.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--danger)' }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
