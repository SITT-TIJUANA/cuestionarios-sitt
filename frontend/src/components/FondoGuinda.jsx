export default function FondoGuinda() {
  return (
    <div className="fondo-guinda" aria-hidden="true">
      <div className="franja-serpiente" style={{ top: '15%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
      <div className="franja-serpiente reversa" style={{ top: '48%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
      <div className="franja-serpiente" style={{ top: '80%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
    </div>
  );
}
