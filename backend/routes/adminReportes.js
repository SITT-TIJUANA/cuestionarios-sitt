import { Router } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../config/db.js';
import { requiereAdmin } from '../config/auth.js';
import { calificar } from '../utils/calificar.js';

const router = Router();
router.use(requiereAdmin);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO = path.join(__dirname, '../assets/escudo.png');

const GUINDA = '#64002F', DORADO = '#C0A252', NEGRO = '#1A1A1A', VERDE = '#0F6E56', ROJO = '#993C1D';

async function bufferDeImagen(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// ---------- Datos individuales (para el modal del admin) ----------
async function datosIndividual(sesionId) {
  const [sesion] = await sql`
    SELECT s.id, s.completado_en, c.titulo AS cuestionario_titulo
    FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id
    WHERE s.id = ${sesionId}
  `;
  if (!sesion) return null;

  const filas = await sql`
    SELECT p.id AS pregunta_id, p.orden, p.tipo, p.texto AS pregunta, p.imagen_url, p.respuesta_correcta,
      r.opcion_id, r.valor_escala, r.texto_respuesta, o.texto AS opcion_texto, o.letra, o.es_correcta
    FROM respuestas r
    JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN opciones o ON o.id = r.opcion_id
    WHERE r.sesion_id = ${sesionId}
    ORDER BY p.orden ASC
  `;

  const detalle = filas.map((f) => {
    const correcto = calificar(f, f);
    let respuestaTexto;
    if (f.tipo === 'opcion_multiple') respuestaTexto = f.opcion_texto ? `${f.letra}) ${f.opcion_texto}` : '(sin responder)';
    else if (f.tipo === 'escala') respuestaTexto = f.valor_escala != null ? `${f.valor_escala}/10` : '(sin responder)';
    else respuestaTexto = f.texto_respuesta || '(sin responder)';
    return {
      pregunta_id: f.pregunta_id, orden: f.orden, tipo: f.tipo, pregunta: f.pregunta,
      imagen_url: f.imagen_url, respuesta: respuestaTexto, correcto
    };
  });

  const calificables = detalle.filter((d) => d.correcto !== null);
  const aciertos = calificables.filter((d) => d.correcto === true).length;

  return {
    sesion: { id: sesion.id, completado_en: sesion.completado_en },
    cuestionario_titulo: sesion.cuestionario_titulo,
    filas: detalle,
    resumen: { aciertos, calificables: calificables.length, total: detalle.length }
  };
}

router.get('/individual/:sesionId', async (req, res) => {
  const datos = await datosIndividual(req.params.sesionId);
  if (!datos) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.json(datos);
});

// ---------- Datos grupales (indicador SITT) ----------
async function datosGrupal(cuestionarioId) {
  const [cuestionario] = await sql`SELECT titulo FROM cuestionarios WHERE id = ${cuestionarioId}`;
  if (!cuestionario) return null;

  const [{ total_sesiones }] = await sql`
    SELECT COUNT(*) AS total_sesiones FROM sesiones WHERE cuestionario_id = ${cuestionarioId} AND completado = true
  `;

  const filas = await sql`
    SELECT p.id AS pregunta_id, p.orden, p.tipo, p.texto AS pregunta, p.imagen_url, p.respuesta_correcta,
      r.opcion_id, r.valor_escala, r.texto_respuesta, o.es_correcta
    FROM sesiones s
    JOIN respuestas r ON r.sesion_id = s.id
    JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN opciones o ON o.id = r.opcion_id
    WHERE s.cuestionario_id = ${cuestionarioId} AND s.completado = true
    ORDER BY p.orden ASC
  `;

  const porPregunta = {};
  let aciertosGlobal = 0, calificablesGlobal = 0;

  for (const f of filas) {
    const correcto = calificar(f, f);
    if (!porPregunta[f.pregunta_id]) {
      porPregunta[f.pregunta_id] = {
        pregunta_id: f.pregunta_id, orden: f.orden, tipo: f.tipo, pregunta: f.pregunta,
        imagen_url: f.imagen_url, aciertos: 0, incorrectos: 0, respuestas: 0
      };
    }
    porPregunta[f.pregunta_id].respuestas++;
    if (correcto === true) { porPregunta[f.pregunta_id].aciertos++; aciertosGlobal++; calificablesGlobal++; }
    else if (correcto === false) { porPregunta[f.pregunta_id].incorrectos++; calificablesGlobal++; }
  }

  const indicador = calificablesGlobal > 0 ? Math.round((aciertosGlobal / calificablesGlobal) * 100) : null;

  return {
    cuestionario_titulo: cuestionario.titulo,
    total_sesiones: Number(total_sesiones),
    indicador,
    aciertos: aciertosGlobal,
    calificables: calificablesGlobal,
    por_pregunta: Object.values(porPregunta).sort((a, b) => a.orden - b.orden)
  };
}

router.get('/grupal/:cuestionarioId', async (req, res) => {
  const datos = await datosGrupal(req.params.cuestionarioId);
  if (!datos) return res.status(404).json({ error: 'Cuestionario no encontrado' });
  res.json(datos);
});

// ---------- Encabezado compartido del PDF ----------
function encabezado(doc, subtitulo) {
  const W = doc.page.width;
  doc.rect(0, 0, W, 90).fill(GUINDA);
  try { doc.image(LOGO, 40, 15, { height: 60 }); } catch {}
  doc.fillColor('white').font('Helvetica-Bold').fontSize(15).text('XXV Ayuntamiento de Tijuana', 120, 26);
  doc.font('Helvetica').fontSize(11).fillColor(DORADO).text(subtitulo, 120, 48);
  doc.fillColor(NEGRO);
}

function iconoResultado(doc, x, y, correcto) {
  if (correcto === true) {
    doc.circle(x, y, 9).fill(VERDE);
    doc.strokeColor('white').lineWidth(1.6)
      .moveTo(x - 4, y).lineTo(x - 1, y + 3).lineTo(x + 4, y - 4).stroke();
  } else if (correcto === false) {
    doc.circle(x, y, 9).fill(ROJO);
    doc.strokeColor('white').lineWidth(1.6)
      .moveTo(x - 3, y - 3).lineTo(x + 3, y + 3).moveTo(x + 3, y - 3).lineTo(x - 3, y + 3).stroke();
  } else {
    doc.circle(x, y, 9).fill('#D3D1C7');
  }
}

// ---------- PDF individual ----------
router.get('/individual/:sesionId/pdf', async (req, res) => {
  try {
    const datos = await datosIndividual(req.params.sesionId);
    if (!datos) return res.status(404).json({ error: 'Sesión no encontrada' });

    const doc = new PDFDocument({ size: 'LETTER', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-individual.pdf"');
    doc.pipe(res);

    const W = doc.page.width, H = doc.page.height;
    encabezado(doc, `Reporte individual · ${datos.cuestionario_titulo}`);

    doc.fontSize(10).fillColor(NEGRO)
      .text(`Completado: ${new Date(datos.sesion.completado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`, 40, 105);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(GUINDA)
      .text(`Aciertos: ${datos.resumen.aciertos} de ${datos.resumen.calificables} preguntas calificables`, 40, 122);

    let y = 155;
    for (const f of datos.filas) {
      if (y > H - 130) { doc.addPage(); encabezado(doc, `Reporte individual · ${datos.cuestionario_titulo}`); y = 105; }

      const inicioBloque = y;
      let xTexto = 40;

      if (f.imagen_url) {
        const buf = await bufferDeImagen(f.imagen_url);
        if (buf) {
          try { doc.image(buf, 40, y, { width: 80, height: 60, fit: [80, 60] }); } catch {}
          xTexto = 135;
        }
      }

      doc.font('Helvetica-Bold').fontSize(10).fillColor(NEGRO)
        .text(`${f.orden}. ${f.pregunta}`, xTexto, y, { width: W - xTexto - 60 });
      doc.font('Helvetica').fontSize(9.5).fillColor('#5F5E5A')
        .text(`Respuesta: ${f.respuesta}`, xTexto, doc.y + 3, { width: W - xTexto - 60 });

      iconoResultado(doc, W - 40, inicioBloque + 20, f.correcto);

      y = Math.max(doc.y + 20, inicioBloque + 75);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte individual' });
  }
});

// ---------- PDF grupal ----------
router.get('/grupal/:cuestionarioId/pdf', async (req, res) => {
  try {
    const datos = await datosGrupal(req.params.cuestionarioId);
    if (!datos) return res.status(404).json({ error: 'Cuestionario no encontrado' });

    const doc = new PDFDocument({ size: 'LETTER', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-grupal.pdf"');
    doc.pipe(res);

    const W = doc.page.width, H = doc.page.height;
    encabezado(doc, `Reporte grupal · ${datos.cuestionario_titulo}`);

    const colorIndicador = datos.indicador == null ? '#8A8478' : datos.indicador >= 80 ? VERDE : datos.indicador >= 50 ? DORADO : ROJO;
    doc.roundedRect(40, 110, W - 80, 90, 12).fill('#FAF1EC');
    doc.font('Helvetica-Bold').fontSize(34).fillColor(colorIndicador)
      .text(datos.indicador == null ? '—' : `${datos.indicador}%`, 60, 130);
    doc.font('Helvetica').fontSize(11).fillColor(NEGRO)
      .text('Indicador SITT de alineación al Código de Ética', 170, 135)
      .text(`${datos.total_sesiones} personas contestaron · ${datos.aciertos} de ${datos.calificables} respuestas correctas`, 170, 152);

    let y = 225;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(GUINDA).text('Resultado por pregunta', 40, y);
    y += 24;

    for (const p of datos.por_pregunta) {
      if (y > H - 110) { doc.addPage(); encabezado(doc, `Reporte grupal · ${datos.cuestionario_titulo}`); y = 105; }

      const total = p.aciertos + p.incorrectos;
      const pct = total > 0 ? Math.round((p.aciertos / total) * 100) : null;
      let xTexto = 40;

      if (p.imagen_url) {
        const buf = await bufferDeImagen(p.imagen_url);
        if (buf) {
          try { doc.image(buf, 40, y, { width: 70, height: 52, fit: [70, 52] }); } catch {}
          xTexto = 125;
        }
      }

      doc.font('Helvetica-Bold').fontSize(10).fillColor(NEGRO)
        .text(`${p.orden}. ${p.pregunta}`, xTexto, y, { width: W - xTexto - 60 });

      if (pct !== null) {
        const barX = xTexto, barY = doc.y + 6, barW = W - xTexto - 130;
        doc.roundedRect(barX, barY, barW, 10, 5).fill('#E5E0D6');
        doc.roundedRect(barX, barY, barW * (pct / 100), 10, 5).fill(pct >= 80 ? VERDE : pct >= 50 ? DORADO : ROJO);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(NEGRO).text(`${pct}%`, barX + barW + 10, barY - 2);
      } else {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#8A8478').text(`${p.respuestas} respuestas (no calificable)`, xTexto, doc.y + 6);
      }

      y = Math.max(doc.y + 24, y + 70);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte grupal' });
  }
});

export default router;
