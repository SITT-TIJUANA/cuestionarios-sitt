import { useRef } from 'react';

export default function EscudoTilt() {
  const ref = useRef(null);

  function mover(x, y) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotY = ((x - cx) / rect.width) * 22;
    const rotX = -((y - cy) / rect.height) * 22;
    el.style.transform = `perspective(500px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
  }

  return (
    <img
      ref={ref}
      src="/cuestionarios-sitt/images/escudo-tijuana.png"
      alt="Escudo XXV Ayuntamiento de Tijuana"
      className="escudo-tilt"
      onMouseMove={(e) => mover(e.clientX, e.clientY)}
      onMouseLeave={reset}
      onTouchMove={(e) => mover(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={reset}
    />
  );
}
