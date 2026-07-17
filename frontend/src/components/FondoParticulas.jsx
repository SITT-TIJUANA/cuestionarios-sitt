const PARTICULAS = Array.from({ length: 22 }).map((_, i) => ({
  izquierda: Math.random() * 100,
  duracion: 8 + Math.random() * 10,
  retraso: Math.random() * 10,
  tamano: 4 + Math.random() * 6,
  opacidad: 0.15 + Math.random() * 0.35
}));

export default function FondoParticulas() {
  return (
    <div className="fondo-particulas" aria-hidden="true">
      {PARTICULAS.map((p, i) => (
        <span
          key={i}
          className="particula"
          style={{
            left: `${p.izquierda}%`,
            width: p.tamano,
            height: p.tamano,
            opacity: p.opacidad,
            animationDuration: `${p.duracion}s`,
            animationDelay: `${p.retraso}s`
          }}
        />
      ))}
    </div>
  );
}
