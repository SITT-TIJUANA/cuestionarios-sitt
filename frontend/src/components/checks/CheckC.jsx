export default function CheckC({ activa }) {
  return (
    <div className={`checkbox-wrapper${activa ? ' marcada' : ''}`}>
      <input type="checkbox" checked={activa} readOnly tabIndex={-1} />
      <label className="label">
        <svg viewBox="0 0 28 28" width="28" height="28">
          <circle className="circulo" cx="14" cy="14" r="11" />
          <g>
            <path className="path1" d="M8 14.5l4 4 8-9" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="400" />
          </g>
        </svg>
      </label>
    </div>
  );
}
