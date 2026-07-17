import { Router } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../config/db.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO = path.join(__dirname, '../assets/escudo.png');

const GUINDA = '#64002F';
const GUINDA_ALT = '#99063F';
const DORADO = '#C0A252';
const NEGRO = '#1A1A1A';
const VERDE = '#006037';

async function obtenerDatosSesion(token) {
  const [sesion] = await sql`
    SELECT s.id, s.cuestionario_id, s.completado_en, c.titulo
    FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id
    WHERE s.token = ${token}
  `;
  if (!sesion) return null;

  const filas = await sql`
    SELECT p.orden, p.tipo, p.texto AS pregunta, o.letra, o.texto AS respuesta,
      o.es_correcta, r.valor_escala, r.texto_respuesta
    FROM respuestas r
    JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN opciones o ON o.id = r.opcion_id
    WHERE r.sesion_id = ${sesion.id}
    ORDER BY p.orden ASC
  `;

  const deOpcionMultiple = filas.filter(f => f.tipo === 'opcion_multiple');
  const correctas = deOpcionMultiple.filter(f => f.es_correcta).length;

  return { ...sesion, filas, correctas, total: deOpcionMultiple.length };
}

// Datos en JSON (para que el frontend genere la imagen del certificado)
router.get('/reportes/:token/datos', async (req, res) => {
  try {
    const datos = await obtenerDatosSesion(req.params.token);
    if (!datos) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json(datos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar los datos del reporte' });
  }
});

router.get('/reportes/:token', async (req, res) => {
  try {
    const datos = await obtenerDatosSesion(req.params.token);
    if (!datos) return res.status(404).json({ error: 'Sesión no encontrada' });

    const doc = new PDFDocument({ size: 'LETTER', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reconocimiento-etica.pdf"');
    doc.pipe(res);

    const W = doc.page.width, H = doc.page.height;

    // Marco decorativo
    doc.rect(0, 0, W, H).fill('#FBF9F6');
    doc.rect(18, 18, W - 36, H - 36).lineWidth(1.5).stroke(DORADO);
    doc.rect(24, 24, W - 48, H - 48).lineWidth(0.75).stroke(GUINDA);

    // Encabezado guinda
    doc.rect(24, 24, W - 48, 100).fill(GUINDA);
    try { doc.image(LOGO, 44, 40, { height: 68 }); } catch {}
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
      .text('XXV AYUNTAMIENTO DE TIJUANA', 130, 52);
    doc.font('Helvetica').fontSize(9).fillColor(DORADO)
      .text('Ética que transforma Tijuana', 130, 68);
    doc.moveTo(130, 88).lineTo(W - 60, 88).lineWidth(0.5).stroke(DORADO);
    doc.fontSize(8).fillColor('white').text(
      new Date(datos.completado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
      130, 96
    );

    // Título de reconocimiento
    doc.fillColor(GUINDA).font('Helvetica-Bold').fontSize(24)
      .text('Reconocimiento de participación', 60, 150, { width: W - 120, align: 'center' });
    doc.font('Helvetica').fontSize(12).fillColor(NEGRO)
      .text(`Por completar el ${datos.titulo}, reafirmando su compromiso`, 60, 182, { width: W - 120, align: 'center' })
      .text('con los valores y principios del Código de Ética institucional.', { width: W - 120, align: 'center' });

    let y = 230;

    if (datos.total > 0) {
      doc.roundedRect(W / 2 - 90, y, 180, 70, 10).fill('#FAF1EC');
      doc.font('Helvetica-Bold').fontSize(30).fillColor(GUINDA)
        .text(`${datos.correctas}/${datos.total}`, W / 2 - 90, y + 14, { width: 180, align: 'center' });
      doc.font('Helvetica').fontSize(9).fillColor(NEGRO)
        .text('respuestas alineadas al Código de Ética', W / 2 - 85, y + 48, { width: 170, align: 'center' });
      y += 100;
    }

    doc.font('Helvetica-Bold').fontSize(11).fillColor(GUINDA).text('Detalle de tus respuestas', 60, y);
    y += 20;

    for (const f of datos.filas) {
      if (y > H - 150) {
        doc.addPage();
        doc.rect(0, 0, W, H).fill('#FBF9F6');
        doc.rect(18, 18, W - 36, H - 36).lineWidth(1.5).stroke(DORADO);
        doc.rect(24, 24, W - 48, H - 48).lineWidth(0.75).stroke(GUINDA);
        y = 50;
      }
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NEGRO)
        .text(`${f.orden}. ${f.pregunta}`, 60, y, { width: W - 120 });
      y = doc.y + 2;

      if (f.tipo === 'opcion_multiple') {
        doc.font('Helvetica').fontSize(9)
          .fillColor(f.es_correcta ? VERDE : GUINDA_ALT)
          .text(`Tu respuesta: ${f.letra}) ${f.respuesta}${f.es_correcta ? '  ·  conducta correcta' : ''}`, 60, y, { width: W - 120 });
      } else if (f.tipo === 'escala') {
        doc.font('Helvetica').fontSize(9).fillColor(NEGRO)
          .text(`Calificación: ${f.valor_escala}/10`, 60, y, { width: W - 120 });
      } else {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(NEGRO)
          .text(`"${f.texto_respuesta || '(sin respuesta)'}"`, 60, y, { width: W - 120 });
      }
      y = doc.y + 10;
    }

    // Pie de "firma"
    const pieY = H - 90;
    doc.moveTo(W / 2 - 90, pieY).lineTo(W / 2 + 90, pieY).lineWidth(0.75).stroke(GUINDA);
    doc.font('Helvetica').fontSize(9).fillColor(GUINDA)
      .text('Dirección de Ética e Integridad Pública', W / 2 - 120, pieY + 6, { width: 240, align: 'center' });
    doc.fontSize(7.5).fillColor('#8A8478')
      .text('Este reconocimiento es de carácter anónimo y personal.', 60, H - 40, { width: W - 120, align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

export default router;
