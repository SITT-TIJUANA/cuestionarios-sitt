import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

const opcionesVacias = () => ([
  { letra: 'A', texto: '', es_correcta: false },
  { letra: 'B', texto: '', es_correcta: false },
  { letra: 'C', texto: '', es_correcta: false }
]);

const vacio = { tipo: 'opcion_multiple', texto: '', opciones: opcionesVacias() };

const ETIQUETAS_TIPO = {
  opcion_multiple: 'Opción múltiple',
  escala: 'Escala 1-10',
  libre: 'Respuesta libre',
  completar: 'Completar la oración'
};

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
    setForm(vacio);
    setImagen(null);
    setEditando('nueva');
  }
  function abrirEditar(p) {
    setForm({
      tipo: p.tipo,
      texto: p.texto,
      opciones: p.tipo === 'opcion_multiple' && p.opciones.length
        ? p.opciones.map((o) => ({ letra: o.letra, texto: o.texto, es_correcta: o.es_correcta }))
        : opcionesVacias()
    });
    setImagen(null);
    setEditando(p.id);
  }

  function cambiarTipo(tipo) {
    setForm((f) => ({ ...f, tipo, opciones: tipo === 'opcion_multiple' ? (f.opciones.length ? f.opciones : opcionesVacias()) : f.opciones }));
  }

  async function guardar(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('cuestionario_id', id);
    fd.append('tipo', form.tipo);
    fd.append('texto', form.texto);
    fd.append('orden', preguntas.length);
    if (form.tipo === 'opcion_multiple') fd.append('opciones', JSON.stringify(form.opciones));
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
      <h1 className="voz" style={{ fontSize: 22, margin: '8px 0 4px' }}>{cuestionario.titulo}</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Puedes mezclar preguntas de opción múltiple, escala y respuesta libre en el mismo cuestionario.
      </p>

      <button className="boton-secundario" style={{ width: 'auto', padding: '8px 16px', marginBottom: 16 }} onClick={abrirNueva}>+ Agregar pregunta</button>

      {editando && (
        <form onSubmit={guardar} className="tarjeta" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Tipo de pregunta</label>
          <select value={form.tipo} onChange={(e) => cambiarTipo(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="opcion_multiple">Opción múltiple (elegir A / B / C)</option>
            <option value="escala">Escala 1-10 (autoevaluación)</option>
            <option value="libre">Respuesta libre (texto escrito)</option>
            <option value="completar">Completar la oración (rellenar espacio)</option>
          </select>

          <textarea placeholder="Texto de la pregunta" required value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', minHeight: 60 }} />
          <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />

          {form.tipo === 'opcion_multiple' && form.opciones.map((op, i) => (
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
          {form.tipo === 'escala' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>El empleado va a deslizar del 1 al 10 para responder — no necesita opciones.</p>
          )}
          {form.tipo === 'libre' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>El empleado va a escribir su respuesta en un cuadro de texto abierto.</p>
          )}
          {form.tipo === 'completar' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Escribe la oración usando <code>___</code> (tres guiones bajos) donde debe ir el espacio en blanco.
              Ejemplo: "El servidor público debe actuar con ___ en todo momento."
            </p>
          )}

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
              <span style={{ fontSize: 11, background: 'var(--cream)', color: 'var(--guinda)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                {ETIQUETAS_TIPO[p.tipo] || p.tipo}
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>{i + 1}. {p.texto}</p>
            </div>
            <button onClick={() => abrirEditar(p)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--guinda)' }}>Editar</button>
            <button onClick={() => eliminar(p.id)} style={{ fontSize: 13, background: 'none', border: 'none', color: 'var(--danger)' }}>Eliminar</button>
          </div>
        ))}
        {preguntas.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aún no hay preguntas. Agrega la primera.</p>}
      </div>
    </div>
  );
}
