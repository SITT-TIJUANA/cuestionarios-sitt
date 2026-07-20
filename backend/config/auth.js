import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'cambia-esto-en-produccion';

export function generarToken(admin) {
  return jwt.sign({ id: admin.id, usuario: admin.usuario }, SECRET, { expiresIn: '12h' });
}

export function requiereAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const token = header.split(' ')[1];
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export { SECRET };
