export default function BotonSitt({ children, onClick, disabled, type = 'button' }) {
  return (
    <button className="Btn" onClick={onClick} disabled={disabled} type={type}>
      <svg className="Layer" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle className="cls-1" cx="50" cy="50" r="49" />
        <circle className="cls-2" cx="50" cy="50" r="40" />
        <circle className="cls-5" cx="50" cy="50" r="30" />
        <circle className="cls-3" cx="50" cy="50" r="21" />
        <circle className="cls-4" cx="50" cy="50" r="12" />
        <circle className="cls-6" cx="50" cy="50" r="4" />
      </svg>
      <span className="text">{children}</span>
    </button>
  );
}
