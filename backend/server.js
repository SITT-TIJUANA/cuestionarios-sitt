import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import publico from './routes/publico.js';
import reportes from './routes/reportes.js';
import adminAuth from './routes/adminAuth.js';
import adminCuestionarios from './routes/adminCuestionarios.js';
import adminPreguntas from './routes/adminPreguntas.js';
import adminEstadisticas from './routes/adminEstadisticas.js';
import adminReportes from './routes/adminReportes.js';

const app = express();

// Red de seguridad: si algo revienta sin estar controlado, se registra en los
// Logs pero YA NO tumba el servidor completo (antes un error en una sola
// pantalla dejaba caída toda la app, incluyendo el login).
process.on('unhandledRejection', (err) => console.error('Error no controlado (unhandledRejection):', err));
process.on('uncaughtException', (err) => console.error('Error no controlado (uncaughtException):', err));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, servicio: 'Cuestionarios SITT API' }));

app.use('/api', publico);
app.use('/api', reportes);
app.use('/api/admin', adminAuth);
app.use('/api/admin/cuestionarios', adminCuestionarios);
app.use('/api/admin/preguntas', adminPreguntas);
app.use('/api/admin/estadisticas', adminEstadisticas);
app.use('/api/admin/reportes', adminReportes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
