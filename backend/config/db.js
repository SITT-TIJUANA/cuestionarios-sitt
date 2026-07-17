import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en las variables de entorno');
}

export const sql = neon(process.env.DATABASE_URL);
