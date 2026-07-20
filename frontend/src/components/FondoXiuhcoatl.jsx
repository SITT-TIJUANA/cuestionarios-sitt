export default function FondoXiuhcoatl() {
  return (
    <div className="fondo-xiuhcoatl" aria-hidden="true">
      <div className="franja-serpiente" style={{ top: '18%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
      <div className="franja-serpiente reversa" style={{ top: '52%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
      <div className="franja-serpiente" style={{ top: '82%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src="/cuestionarios-sitt/images/xiuhcoatl.png" alt="" />
        ))}
      </div>
    </div>
  );
}
