export default function Marca({ variante = 0, activa }) {
  const formas = [
    <circle key="c" className="marca-circulo" cx="13" cy="13" r="11" strokeWidth="2.5" />,
    <rect key="r" className="marca-circulo" x="2" y="2" width="22" height="22" rx="7" strokeWidth="2.5" />,
    <polygon key="p" className="marca-circulo" strokeWidth="2.5"
      points="13,1 16,9.5 25,9.5 17.8,15 20.5,24 13,18.5 5.5,24 8.2,15 1,9.5 10,9.5" />
  ];

  return (
    <span className={`marca${activa ? ' activa' : ''}`}>
      <svg viewBox="0 0 26 26">
        {formas[variante % formas.length]}
        <path className="marca-check" d="M7 13.5l4 4 8-9" strokeWidth="3" />
      </svg>
    </span>
  );
}
