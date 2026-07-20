// Decide si una respuesta es correcta. Regresa true / false / null (null = no aplica calificar).
export function calificar(pregunta, respuesta) {
  if (pregunta.tipo === 'opcion_multiple') {
    if (respuesta.opcion_id == null) return null;
    return respuesta.es_correcta === true;
  }

  if (!pregunta.respuesta_correcta) return null;

  if (pregunta.tipo === 'completar' || pregunta.tipo === 'libre') {
    if (respuesta.texto_respuesta == null) return null;
    return respuesta.texto_respuesta.trim().toLowerCase() === pregunta.respuesta_correcta.trim().toLowerCase();
  }

  if (pregunta.tipo === 'escala') {
    const umbral = Number(pregunta.respuesta_correcta);
    if (Number.isNaN(umbral) || respuesta.valor_escala == null) return null;
    return respuesta.valor_escala >= umbral;
  }

  return null;
}
