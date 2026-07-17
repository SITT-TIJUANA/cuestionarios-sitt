import CheckA from './checks/CheckA';
import CheckB from './checks/CheckB';
import CheckC from './checks/CheckC';

const variantes = [CheckA, CheckB, CheckC];

export default function Marca({ variante = 0, activa }) {
  const Componente = variantes[variante % variantes.length];
  return <Componente activa={activa} />;
}
