const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function peticion(path, opciones = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { ...(opciones.headers || {}) };
  if (!(opciones.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token && path.startsWith('/api/admin')) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opciones, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || 'Error de conexión');
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.blob();
}

export const api = {
  // público
  cuestionarioActivo: () => peticion('/api/cuestionarios/activo'),
  cuestionarioPorId: (id) => peticion(`/api/cuestionarios/${id}`),
  crearSesion: (cuestionario_id) => peticion('/api/sesiones', { method: 'POST', body: JSON.stringify({ cuestionario_id }) }),
  guardarRespuesta: (data) => peticion('/api/respuestas', { method: 'POST', body: JSON.stringify(data) }),
  completarSesion: (token) => peticion(`/api/sesiones/${token}/completar`, { method: 'POST' }),
  datosReporte: (token) => peticion(`/api/reportes/${token}/datos`),
  urlReporte: (token) => `${API_URL}/api/reportes/${token}`,

  // admin
  login: (usuario, password) => peticion('/api/admin/login', { method: 'POST', body: JSON.stringify({ usuario, password }) }),
  listarCuestionarios: () => peticion('/api/admin/cuestionarios'),
  crearCuestionario: (data) => peticion('/api/admin/cuestionarios', { method: 'POST', body: JSON.stringify(data) }),
  activarCuestionario: (id) => peticion(`/api/admin/cuestionarios/${id}/activar`, { method: 'PUT' }),
  desactivarCuestionario: (id) => peticion(`/api/admin/cuestionarios/${id}/desactivar`, { method: 'PUT' }),
  eliminarCuestionario: (id) => peticion(`/api/admin/cuestionarios/${id}`, { method: 'DELETE' }),

  listarPreguntas: (cuestionarioId) => peticion(`/api/admin/preguntas/cuestionario/${cuestionarioId}`),
  crearPregunta: (formData) => peticion('/api/admin/preguntas', { method: 'POST', body: formData }),
  editarPregunta: (id, formData) => peticion(`/api/admin/preguntas/${id}`, { method: 'PUT', body: formData }),
  eliminarPregunta: (id) => peticion(`/api/admin/preguntas/${id}`, { method: 'DELETE' }),

  resumen: (cuestionarioId) => peticion(`/api/admin/estadisticas/resumen/${cuestionarioId}`),
  porPregunta: (cuestionarioId) => peticion(`/api/admin/estadisticas/por-pregunta/${cuestionarioId}`),
  promedios: (cuestionarioId) => peticion(`/api/admin/estadisticas/promedios/${cuestionarioId}`),
  sesiones: (cuestionarioId, filtros = {}) => {
    const qs = new URLSearchParams(filtros).toString();
    return peticion(`/api/admin/estadisticas/sesiones/${cuestionarioId}${qs ? '?' + qs : ''}`);
  },
  detalleSesion: (sesionId) => peticion(`/api/admin/estadisticas/sesiones/detalle/${sesionId}`),
  urlExportar: (cuestionarioId) => `${API_URL}/api/admin/estadisticas/exportar/${cuestionarioId}`,
};
