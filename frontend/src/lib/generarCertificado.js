function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Rectángulo redondeado dibujado a mano — compatible con TODOS los celulares
// (ctx.roundRect nativo no existe en muchos Android ni en iPhones con iOS viejo)
function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
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

  const GUINDA_ALT = '#99063F', DORADO = '#C0A252', CREMA = '#E8D9A8';

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

  let serpiente = null;
  try { serpiente = await cargarImagen('/cuestionarios-sitt/images/xiuhcoatl.png'); } catch {}

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
  ctx.font = '700 60px Poppins, sans-serif';
  ctx.fillText('Reconocimiento', W / 2, 350);
  ctx.fillText('de participación', W / 2, 420);

  ctx.font = '400 22px Inter, sans-serif';
  ctx.fillStyle = CREMA;
  envolverTexto(ctx, `Por completar el ${datos.titulo}, reafirmando tu compromiso con los valores del Código de Ética institucional.`, W / 2, 475, W - 220, 30);

  let y = 590;
  if (datos.total > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    rectRedondeado(ctx, W / 2 - 160, y, 320, 150, 20);
    ctx.fill();
    ctx.fillStyle = DORADO;
    ctx.font = '700 64px Poppins, sans-serif';
    ctx.fillText(`${datos.correctas}/${datos.total}`, W / 2, y + 95);
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('respuestas alineadas al Código de Ética', W / 2, y + 130);
    y += 190;
  } else {
    y += 20;
  }

  // Franja decorativa dorada con el motivo Xiuhcóatl (6 repeticiones, parejo en todo el ancho)
  if (serpiente) {
    const altoIcono = 32, anchoIcono = altoIcono * (serpiente.width / serpiente.height);
    const cantidad = 6;
    const espacio = 22;
    const anchoTotal = cantidad * anchoIcono + (cantidad - 1) * espacio;
    ctx.globalAlpha = 0.5;
    let ix = W / 2 - anchoTotal / 2;
    for (let i = 0; i < cantidad; i++) {
      ctx.drawImage(serpiente, ix, y, anchoIcono, altoIcono);
      ix += anchoIcono + espacio;
    }
    ctx.globalAlpha = 1;
    y += altoIcono + 30;
  }

  ctx.font = '500 22px Inter, sans-serif';
  ctx.fillStyle = 'white';
  y = envolverTexto(ctx, 'Gracias por tu compromiso con la ética pública en Tijuana.', W / 2, y, W - 260, 30);
  y += 30;

  const FRASES = [
    'Personas como tú son las que construyen, todos los días, un mejor gobierno para Tijuana.',
    'Tu honestidad y tu ejemplo hacen la diferencia en cada trámite, cada decisión, cada día de servicio.',
    'Gracias por elegir hacer lo correcto, incluso cuando nadie te está mirando. Eso es integridad.',
    'El SITT es mejor porque tú eres parte de él. Gracias por tu compromiso.'
  ];
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  rectRedondeado(ctx, 90, y, W - 180, 190, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(192,162,82,0.5)';
  ctx.lineWidth = 1;
  rectRedondeado(ctx, 90, y, W - 180, 190, 20);
  ctx.stroke();

  ctx.font = '700 40px Poppins, sans-serif';
  ctx.fillStyle = DORADO;
  ctx.fillText('"', W / 2, y + 55);

  ctx.font = '500 23px Inter, sans-serif';
  ctx.fillStyle = 'white';
  envolverTexto(ctx, frase, W / 2, y + 90, W - 260, 32);

  ctx.font = '600 16px Inter, sans-serif';
  ctx.fillStyle = DORADO;
  ctx.fillText('— Equipo SITT Tijuana', W / 2, y + 165);

  y += 230;

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
