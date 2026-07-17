import { Router } from 'express';
import multer from 'multer';
import { sql } from '../config/db.js';
import { requiereAdmin } from '../config/auth.js';
import { subirImagenBuffer, borrarImagen } from '../config/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
router.use(requiereAdmin);

router.get('/cuestionario/:cuestionarioId', async (req, res) => {
  const preguntas = await sql`
    SELECT * FROM preguntas WHERE cuestionario_id = ${req.params.cuestionarioId} ORDER BY orden ASC
  `;
  for (const p of preguntas) {
    p.opciones = await sql`SELECT * FROM opciones WHERE pregunta_id = ${p.id} ORDER BY orden ASC`;
  }
  res.json(preguntas);
});

// Crear pregunta con imagen opcional + opciones en un solo request (multipart/form-data)
// campos: cuestionario_id, texto, orden, opciones (JSON string), imagen (file)
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { cuestionario_id, texto, orden } = req.body;
    const tipo = req.body.tipo || 'opcion_multiple';
    const opciones = req.body.opciones ? JSON.parse(req.body.opciones) : [];

    let imagen_url = null, imagen_public_id = null;
    if (req.file) {
      const subida = await subirImagenBuffer(req.file.buffer);
      imagen_url = subida.secure_url;
      imagen_public_id = subida.public_id;
    }

    const [pregunta] = await sql`
      INSERT INTO preguntas (cuestionario_id, tipo, texto, imagen_url, imagen_public_id, orden, respuesta_correcta)
      VALUES (${cuestionario_id}, ${tipo}, ${texto}, ${imagen_url}, ${imagen_public_id}, ${orden || 0}, ${req.body.respuesta_correcta || null})
      RETURNING *
    `;

    if (tipo === 'opcion_multiple') {
      for (const [i, op] of opciones.entries()) {
        await sql`
          INSERT INTO opciones (pregunta_id, letra, texto, es_correcta, orden)
          VALUES (${pregunta.id}, ${op.letra}, ${op.texto}, ${op.es_correcta || false}, ${i})
        `;
      }
    }

    res.json(pregunta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la pregunta' });
  }
});

// Editar pregunta (texto, orden, y opcionalmente reemplazar imagen)
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { texto, orden } = req.body;
    const [actual] = await sql`SELECT * FROM preguntas WHERE id = ${req.params.id}`;
    if (!actual) return res.status(404).json({ error: 'Pregunta no encontrada' });
    const tipo = req.body.tipo || actual.tipo;

    let imagen_url = actual.imagen_url, imagen_public_id = actual.imagen_public_id;
    if (req.file) {
      await borrarImagen(actual.imagen_public_id);
      const subida = await subirImagenBuffer(req.file.buffer);
      imagen_url = subida.secure_url;
      imagen_public_id = subida.public_id;
    }

    const [pregunta] = await sql`
      UPDATE preguntas SET texto = ${texto}, orden = ${orden ?? actual.orden}, tipo = ${tipo},
        imagen_url = ${imagen_url}, imagen_public_id = ${imagen_public_id},
        respuesta_correcta = ${req.body.respuesta_correcta ?? actual.respuesta_correcta}
      WHERE id = ${req.params.id} RETURNING *
    `;

    if (tipo === 'opcion_multiple' && req.body.opciones) {
      const opciones = JSON.parse(req.body.opciones);
      await sql`DELETE FROM opciones WHERE pregunta_id = ${pregunta.id}`;
      for (const [i, op] of opciones.entries()) {
        await sql`
          INSERT INTO opciones (pregunta_id, letra, texto, es_correcta, orden)
          VALUES (${pregunta.id}, ${op.letra}, ${op.texto}, ${op.es_correcta || false}, ${i})
        `;
      }
    } else if (tipo !== 'opcion_multiple') {
      await sql`DELETE FROM opciones WHERE pregunta_id = ${pregunta.id}`;
    }

    res.json(pregunta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al editar la pregunta' });
  }
});

router.delete('/:id', async (req, res) => {
  const [p] = await sql`SELECT imagen_public_id FROM preguntas WHERE id = ${req.params.id}`;
  if (p) await borrarImagen(p.imagen_public_id);
  await sql`DELETE FROM preguntas WHERE id = ${req.params.id}`;
  res.json({ ok: true });
});

export default router;
