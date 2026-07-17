function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function envolverTexto(ctx, texto, x, y, maxAncho, lineHeight) {
  const palabras = texto.split(' ');
  let linea = '';
  for (const palabra of palabras) {
    const prueba = linea + palabra + ' ';
    if (ctx.measureText(prueba).width > maxAncho && linea !== '') {
      ctx.fillText(linea.trim(), x, y);
      linea = palabra + ' ';
      y += lineHeight;
    } else {
      linea = prueba;
    }
  }
  ctx.fillText(linea.trim(), x, y);
  return y + lineHeight;
}

export async function generarImagenCertificado(datos) {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const GUINDA = '#64002F', GUINDA_ALT = '#99063F', DORADO = '#C0A252', VERDE = '#006037', CREMA = '#E8D9A8';

  const grad = ctx.createRadialGradient(W / 2, H * 0.25, 60, W / 2, H * 0.25, H);
  grad.addColorStop(0, GUINDA_ALT);
  grad.addColorStop(1, '#33001A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = DORADO;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 1;
  ctx.strokeRect(46, 46, W - 92, H - 92);

  try {
    const logo = await cargarImagen('/cuestionarios-sitt/images/escudo-tijuana.png');
    const alto = 130, ancho = alto * (logo.width / logo.height);
    ctx.drawImage(logo, W / 2 - ancho / 2, 90, ancho, alto);
  } catch {}

  ctx.textAlign = 'center';
  ctx.fillStyle = DORADO;
  ctx.font = '600 26px Poppins, sans-serif';
  ctx.fillText('XXV AYUNTAMIENTO DE TIJUANA', W / 2, 262);

  ctx.fillStyle = 'white';
  ctx.font = '700 46px Poppins, sans-serif';
  ctx.fillText('Reconocimiento', W / 2, 340);
  ctx.fillText('de participación', W / 2, 396);

  ctx.font = '400 22px Inter, sans-serif';
  ctx.fillStyle = CREMA;
  envolverTexto(ctx, `Por completar el ${datos.titulo}, reafirmando tu compromiso con los valores del Código de Ética institucional.`, W / 2, 450, W - 220, 30);

  let y = 560;
  if (datos.total > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 160, y, 320, 150, 20);
    ctx.fill();
    ctx.fillStyle = DORADO;
    ctx.font = '700 64px Poppins, sans-serif';
    ctx.fillText(`${datos.correctas}/${datos.total}`, W / 2, y + 95);
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('respuestas alineadas al Código de Ética', W / 2, y + 130);
    y += 190;
  }

  ctx.font = '600 22px Inter, sans-serif';
  ctx.textAlign = 'left';
  let by = y;
  for (const f of datos.filas.slice(0, 6)) {
    if (f.tipo === 'escala') {
      ctx.fillStyle = 'white';
      ctx.fillText(f.pregunta, 120, by);
      const barX = 120, barW = W - 240, barY = by + 12;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, 14, 7); ctx.fill();
      ctx.fillStyle = DORADO;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * (f.valor_escala / 10), 14, 7); ctx.fill();
      by += 62;
    }
  }
  ctx.textAlign = 'center';

  ctx.strokeStyle = DORADO;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, H - 150);
  ctx.lineTo(W / 2 + 140, H - 150);
  ctx.stroke();
  ctx.fillStyle = CREMA;
  ctx.font = '500 20px Inter, sans-serif';
  ctx.fillText('Ética que transforma Tijuana', W / 2, H - 115);
  ctx.font = '400 16px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const fecha = new Date(datos.completado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillText(fecha, W / 2, H - 85);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
