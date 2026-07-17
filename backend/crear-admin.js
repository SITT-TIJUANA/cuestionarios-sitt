// Uso: node crear-admin.js usuario contraseña
// Crea (o actualiza la contraseña de) un usuario admin en la base de datos.
import bcrypt from 'bcryptjs';
import { sql } from './config/db.js';

const [, , usuario, password] = process.argv;

if (!usuario || !password) {
  console.log('Uso: node crear-admin.js <usuario> <contraseña>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

await sql`
  INSERT INTO admins (usuario, password_hash) VALUES (${usuario}, ${hash})
  ON CONFLICT (usuario) DO UPDATE SET password_hash = ${hash}
`;

console.log(`Listo. Admin "${usuario}" creado/actualizado.`);
process.exit(0);
