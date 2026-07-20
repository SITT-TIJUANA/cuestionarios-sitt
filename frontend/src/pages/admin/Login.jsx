import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError('');
    try {
      const { token } = await api.login(usuario, password);
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="contenedor" style={{ justifyContent: 'center' }}>
      <h1 className="voz" style={{ fontSize: 22, marginBottom: 20 }}>Panel administrativo</h1>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border)' }} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border)' }} />
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        <button className="boton-primario" type="submit">Entrar</button>
      </form>
    </div>
  );
}
