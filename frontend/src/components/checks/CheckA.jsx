export default function CheckA({ activa }) {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={activa} readOnly tabIndex={-1} />
      <svg className="checkmark sizer" viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="11" />
        <path d="M7 13.5l4 4 8-9" fill="none" pathLength="28" />
      </svg>
    </label>
  );
}
