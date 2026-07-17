import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { sql } from '../config/db.js';

const router = Router();

const GUINDA = '#7B1D1D';
const GOLD = '#C9A84C';
const INK = '#2B2118';

router.get('/reportes/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const [sesion] = await sql`
      SELECT s.id, s.cuestionario_id, c.titulo, c.tipo
      FROM sesiones s JOIN cuestionarios c ON c.id = s.cuestionario_id
      WHERE s.token = ${token}
    `;
    if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });

    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-etica.pdf"');
    doc.pipe(res);

    // Encabezado institucional
    doc.rect(0, 0, doc.page.width, 70).fill(GUINDA);
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
      .text('XXV Ayuntamiento de Tijuana', 50, 22);
    doc.fontSize(11).font('Helvetica').fillColor(GOLD)
      .text(sesion.titulo, 50, 45);
    doc.fillColor(INK);
    doc.moveDown(3);

    if (sesion.tipo === 'opcion_multiple') {
      const filas = await sql`
        SELECT p.orden, p.texto AS pregunta, o.letra, o.texto AS respuesta, o.es_correcta
        FROM respuestas r
        JOIN preguntas p ON p.id = r.pregunta_id
        LEFT JOIN opciones o ON o.id = r.opcion_id
        WHERE r.sesion_id = ${sesion.id}
        ORDER BY p.orden ASC
      `;
      let correctas = 0;
      doc.moveDown(2);
      for (const f of filas) {
        if (f.es_correcta) correctas++;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(INK)
          .text(`${f.orden}. ${f.pregunta}`);
        doc.fontSize(10).font('Helvetica')
          .fillColor(f.es_correcta ? '#0F6E56' : '#993C1D')
          .text(`Tu respuesta: ${f.letra}) ${f.respuesta}  ${f.es_correcta ? '(conducta correcta)' : ''}`);
        doc.moveDown(0.8);
      }
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(GUINDA)
        .text(`Resultado: ${correctas} de ${filas.length} respuestas alineadas al Código de Ética`);
    } else {
      const filas = await sql`
        SELECT p.texto AS valor, r.valor_escala
        FROM respuestas r JOIN preguntas p ON p.id = r.pregunta_id
        WHERE r.sesion_id = ${sesion.id}
        ORDER BY p.orden ASC
      `;
      doc.moveDown(2);
      for (const f of filas) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(INK).text(f.valor);
        const ancho = 300;
        const x = doc.x, y = doc.y + 4;
        doc.rect(x, y, ancho, 10).stroke('#D3D1C7');
        doc.rect(x, y, ancho * (f.valor_escala / 10), 10).fill(GOLD);
        doc.fillColor(INK).fontSize(10).text(`${f.valor_escala}/10`, x + ancho + 10, y - 2);
        doc.moveDown(1.6);
      }
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#5F5E5A').font('Helvetica')
      .text('Este reporte es de carácter anónimo y personal. Ética que transforma Tijuana.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

export default router;
