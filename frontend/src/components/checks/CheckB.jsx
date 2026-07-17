export default function CheckB({ activa }) {
  return (
    <label className="neon-checkbox">
      <input type="checkbox" checked={activa} readOnly tabIndex={-1} />
      <div className="neon-checkbox__frame">
        <div className="neon-checkbox__box">
          <div className="neon-checkbox__check-container">
            <svg viewBox="0 0 24 24" className="neon-checkbox__check">
              <path d="M3,12.5l7,7L21,4" />
            </svg>
          </div>
          <div className="neon-checkbox__glow" />
          <div className="neon-checkbox__borders">
            <span /><span /><span /><span />
          </div>
        </div>
      </div>
    </label>
  );
}
