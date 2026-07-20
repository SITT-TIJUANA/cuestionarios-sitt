import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { sql } from '../config/db.js';
import { generarToken } from '../config/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const [admin] = await sql`SELECT * FROM admins WHERE usuario = ${usuario}`;
    if (!admin) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    res.json({ token: generarToken(admin), usuario: admin.usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;
