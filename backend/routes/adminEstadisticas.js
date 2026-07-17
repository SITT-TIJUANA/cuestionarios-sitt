import { Router } from 'express';
import { sql } from '../config/db.js';
import { requiereAdmin } from '../config/auth.js';

const router = Router();
router.use(requiereAdmin);

// Resumen general (KPIs)
router.get('/resumen/:cuestionarioId', async (req, res) => {
  const { cuestionarioId } = req.params;
  const [total] = await sql`
    SELECT COUNT(*) AS total FROM sesiones WHERE cuestionario_id = ${cuestionarioId} AND completado = true
  `;
  res.json({ total_respuestas: Number(total.total) });
});

// Por pregunta: % de cada opción elegida (solo preguntas tipo opcion_multiple)
router.get('/por-pregunta/:cuestionarioId', async (req, res) => {
  const { cuestionarioId } = req.params;
  const filas = await sql`
    SELECT p.id AS pregunta_id, p.texto AS pregunta, p.orden, o.letra, o.texto AS opcion,
      COUNT(r.id) AS total
    FROM preguntas p
    LEFT JOIN opciones o ON o.pregunta_id = p.id
    LEFT JOIN respuestas r ON r.opcion_id = o.id
    WHERE p.cuestionario_id = ${cuestionarioId} AND p.tipo = 'opcion_multiple'
    GROUP BY p.id, p.texto, p.orden, o.letra, o.texto
    ORDER BY p.orden ASC, o.letra ASC
  `;
  res.json(filas);
});

// Promedio por valor (solo preguntas tipo escala)
router.get('/promedios/:cuestionarioId', async (req, res) => {
  const { cuestionarioId } = req.params;
  const filas = await sql`
    SELECT p.id AS pregunta_id, p.texto AS valor, p.orden,
      ROUND(AVG(r.valor_escala)::numeric, 1) AS promedio, COUNT(r.id) AS total
    FROM preguntas p
    LEFT JOIN respuestas r ON r.pregunta_id = p.id
    WHERE p.cuestionario_id = ${cuestionarioId} AND p.tipo = 'escala'
    GROUP BY p.id, p.texto, p.orden
    ORDER BY p.orden ASC
  `;
  res.json(filas);
});

// Respuestas de texto libre y "completar la oración", agrupadas por pregunta
router.get('/libres/:cuestionarioId', async (req, res) => {
  const { cuestionarioId } = req.params;
  const filas = await sql`
    SELECT p.id AS pregunta_id, p.texto AS pregunta, p.orden, r.texto_respuesta, r.creado_en
    FROM preguntas p
    JOIN respuestas r ON r.pregunta_id = p.id
    WHERE p.cuestionario_id = ${cuestionarioId} AND p.tipo IN ('libre', 'completar') AND r.texto_respuesta IS NOT NULL
    ORDER BY p.orden ASC, r.creado_en DESC
  `;
  const agrupadas = {};
  for (const f of filas) {
    if (!agrupadas[f.pregunta_id]) agrupadas[f.pregunta_id] = { pregunta: f.pregunta, orden: f.orden, respuestas: [] };
    agrupadas[f.pregunta_id].respuestas.push(f.texto_respuesta);
  }
  res.json(Object.values(agrupadas).sort((a, b) => a.orden - b.orden));
});

// Listado de sesiones individuales (anónimas, con filtro de fecha opcional)
router.get('/sesiones/:cuestionarioId', async (req, res) => {
  const { cuestionarioId } = req.params;
  const { desde, hasta } = req.query;
  const sesiones = await sql`
    SELECT id, token, iniciado_en, completado_en
    FROM sesiones
    WHERE cuestionario_id = ${cuestionarioId} AND completado = true
      AND (${desde || null}::date IS NULL OR completado_en >= ${desde || null}::date)
      AND (${hasta || null}::date IS NULL OR completado_en < (${hasta || null}::date + INTERVAL '1 day'))
    ORDER BY completado_en DESC
  `;
  res.json(sesiones);
});

// Detalle de una sesión individual
router.get('/sesiones/detalle/:sesionId', async (req, res) => {
  const filas = await sql`
    SELECT p.texto AS pregunta, o.texto AS respuesta, r.valor_escala, r.texto_respuesta
    FROM respuestas r
    JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN opciones o ON o.id = r.opcion_id
    WHERE r.sesion_id = ${req.params.sesionId}
    ORDER BY p.orden ASC
  `;
  res.json(filas);
});

// Exportar CSV de todas las respuestas de un cuestionario
router.get('/exportar/:cuestionarioId', async (req, res) => {
  const filas = await sql`
    SELECT s.id AS sesion, s.completado_en, p.orden, p.texto AS pregunta,
      COALESCE(o.texto, r.valor_escala::text, r.texto_respuesta) AS respuesta
    FROM respuestas r
    JOIN sesiones s ON s.id = r.sesion_id
    JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN opciones o ON o.id = r.opcion_id
    WHERE s.cuestionario_id = ${req.params.cuestionarioId} AND s.completado = true
    ORDER BY s.id, p.orden
  `;
  let csv = 'sesion,fecha,pregunta,respuesta\n';
  for (const f of filas) {
    const limpia = (t) => `"${String(t).replace(/"/g, '""')}"`;
    csv += `${f.sesion},${f.completado_en?.toISOString?.() || ''},${limpia(f.pregunta)},${limpia(f.respuesta)}\n`;
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="cuestionario-${req.params.cuestionarioId}.csv"`);
  res.send(csv);
});

export default router;
