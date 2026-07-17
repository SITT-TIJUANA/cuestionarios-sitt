import { Router } from 'express';
import { sql } from '../config/db.js';

const router = Router();

// Obtener el cuestionario activo con sus preguntas y opciones
router.get('/cuestionarios/activo', async (req, res) => {
  try {
    const [cuestionario] = await sql`
      SELECT id, titulo, descripcion, tipo, tiempo_estimado_min
      FROM cuestionarios WHERE activo = true
      ORDER BY id DESC LIMIT 1
    `;
    if (!cuestionario) {
      return res.status(404).json({ error: 'No hay ningún cuestionario activo por ahora' });
    }

    const preguntas = await sql`
      SELECT id, texto, imagen_url, orden
      FROM preguntas WHERE cuestionario_id = ${cuestionario.id}
      ORDER BY orden ASC
    `;

    if (cuestionario.tipo === 'opcion_multiple') {
      const opciones = await sql`
        SELECT o.id, o.pregunta_id, o.letra, o.texto, o.orden
        FROM opciones o
        JOIN preguntas p ON p.id = o.pregunta_id
        WHERE p.cuestionario_id = ${cuestionario.id}
        ORDER BY o.orden ASC
      `;
      for (const p of preguntas) {
        p.opciones = opciones.filter(o => o.pregunta_id === p.id);
      }
    }

    res.json({ ...cuestionario, preguntas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar el cuestionario' });
  }
});

// Obtener un cuestionario específico por ID (para acceso directo vía QR/enlace)
router.get('/cuestionarios/:id', async (req, res) => {
  try {
    const [cuestionario] = await sql`
      SELECT id, titulo, descripcion, tipo, tiempo_estimado_min, activo
      FROM cuestionarios WHERE id = ${req.params.id}
    `;
    if (!cuestionario) return res.status(404).json({ error: 'Cuestionario no encontrado' });
    if (!cuestionario.activo) return res.status(404).json({ error: 'Este cuestionario no está activo por ahora' });

    const preguntas = await sql`
      SELECT id, texto, imagen_url, orden
      FROM preguntas WHERE cuestionario_id = ${cuestionario.id}
      ORDER BY orden ASC
    `;

    if (cuestionario.tipo === 'opcion_multiple') {
      const opciones = await sql`
        SELECT o.id, o.pregunta_id, o.letra, o.texto, o.orden
        FROM opciones o
        JOIN preguntas p ON p.id = o.pregunta_id
        WHERE p.cuestionario_id = ${cuestionario.id}
        ORDER BY o.orden ASC
      `;
      for (const p of preguntas) {
        p.opciones = opciones.filter(o => o.pregunta_id === p.id);
      }
    }

    res.json({ ...cuestionario, preguntas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar el cuestionario' });
  }
});

// Crear una sesión anónima nueva al escanear el QR / entrar
router.post('/sesiones', async (req, res) => {
  try {
    const { cuestionario_id } = req.body;
    if (!cuestionario_id) return res.status(400).json({ error: 'Falta cuestionario_id' });

    const [sesion] = await sql`
      INSERT INTO sesiones (cuestionario_id) VALUES (${cuestionario_id})
      RETURNING token
    `;
    res.json({ token: sesion.token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar la sesión' });
  }
});

// Guardar una respuesta (se llama pregunta por pregunta, según avanza)
router.post('/respuestas', async (req, res) => {
  try {
    const { token, pregunta_id, opcion_id, valor_escala } = req.body;
    if (!token || !pregunta_id) return res.status(400).json({ error: 'Faltan datos' });

    const [sesion] = await sql`SELECT id, completado FROM sesiones WHERE token = ${token}`;
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
    if (sesion.completado) return res.status(400).json({ error: 'Esta sesión ya fue enviada' });

    await sql`
      INSERT INTO respuestas (sesion_id, pregunta_id, opcion_id, valor_escala)
      VALUES (${sesion.id}, ${pregunta_id}, ${opcion_id || null}, ${valor_escala || null})
      ON CONFLICT (sesion_id, pregunta_id)
      DO UPDATE SET opcion_id = EXCLUDED.opcion_id, valor_escala = EXCLUDED.valor_escala
    `;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la respuesta' });
  }
});

// Marcar la sesión como completada
router.post('/sesiones/:token/completar', async (req, res) => {
  try {
    const { token } = req.params;
    const [sesion] = await sql`
      UPDATE sesiones SET completado = true, completado_en = NOW()
      WHERE token = ${token} RETURNING id
    `;
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al completar la sesión' });
  }
});

export default router;
