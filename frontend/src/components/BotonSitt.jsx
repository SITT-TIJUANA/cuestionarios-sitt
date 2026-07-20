export default function BotonSitt({ children, onClick, disabled, type = 'button' }) {
  return (
    <button className="boton-uiverse" onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
