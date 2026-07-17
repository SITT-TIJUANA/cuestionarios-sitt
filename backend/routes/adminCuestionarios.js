import { Router } from 'express';
import { sql } from '../config/db.js';
import { requiereAdmin } from '../config/auth.js';

const router = Router();
router.use(requiereAdmin);

router.get('/', async (req, res) => {
  const cuestionarios = await sql`
    SELECT c.*, COUNT(DISTINCT p.id) AS total_preguntas,
      COUNT(DISTINCT s.id) FILTER (WHERE s.completado) AS total_respuestas
    FROM cuestionarios c
    LEFT JOIN preguntas p ON p.cuestionario_id = c.id
    LEFT JOIN sesiones s ON s.cuestionario_id = c.id
    GROUP BY c.id ORDER BY c.id DESC
  `;
  res.json(cuestionarios);
});

router.post('/', async (req, res) => {
  const { titulo, descripcion, tipo, tiempo_estimado_min } = req.body;
  const [c] = await sql`
    INSERT INTO cuestionarios (titulo, descripcion, tipo, tiempo_estimado_min)
    VALUES (${titulo}, ${descripcion || null}, ${tipo}, ${tiempo_estimado_min || 3})
    RETURNING *
  `;
  res.json(c);
});

router.put('/:id', async (req, res) => {
  const { titulo, descripcion, tiempo_estimado_min } = req.body;
  const [c] = await sql`
    UPDATE cuestionarios SET titulo = ${titulo}, descripcion = ${descripcion || null},
      tiempo_estimado_min = ${tiempo_estimado_min || 3}
    WHERE id = ${req.params.id} RETURNING *
  `;
  res.json(c);
});

// Cada cuestionario tiene su propio QR/enlace, así que varios pueden estar activos a la vez
router.put('/:id/activar', async (req, res) => {
  const [c] = await sql`UPDATE cuestionarios SET activo = true WHERE id = ${req.params.id} RETURNING *`;
  res.json(c);
});

router.put('/:id/desactivar', async (req, res) => {
  const [c] = await sql`UPDATE cuestionarios SET activo = false WHERE id = ${req.params.id} RETURNING *`;
  res.json(c);
});

router.delete('/:id', async (req, res) => {
  await sql`DELETE FROM cuestionarios WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
