import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import publico from './routes/publico.js';
import reportes from './routes/reportes.js';
import adminAuth from './routes/adminAuth.js';
import adminCuestionarios from './routes/adminCuestionarios.js';
import adminPreguntas from './routes/adminPreguntas.js';
import adminEstadisticas from './routes/adminEstadisticas.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, servicio: 'Cuestionarios SITT API' }));

app.use('/api', publico);
app.use('/api', reportes);
app.use('/api/admin', adminAuth);
app.use('/api/admin/cuestionarios', adminCuestionarios);
app.use('/api/admin/preguntas', adminPreguntas);
app.use('/api/admin/estadisticas', adminEstadisticas);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
