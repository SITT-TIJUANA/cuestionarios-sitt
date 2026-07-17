import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bienvenida from './pages/Bienvenida';
import Cuestionario from './pages/Cuestionario';
import Gracias from './pages/Gracias';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Preguntas from './pages/admin/Preguntas';
import Estadisticas from './pages/admin/Estadisticas';
import Reportes from './pages/admin/Reportes';
import RutaProtegida from './components/RutaProtegida';

export default function App() {
  return (
    <BrowserRouter basename="/cuestionarios-sitt">
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/responder" element={<Cuestionario />} />
        <Route path="/gracias" element={<Gracias />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/admin/cuestionarios/:id" element={<RutaProtegida><Preguntas /></RutaProtegida>} />
        <Route path="/admin/cuestionarios/:id/estadisticas" element={<RutaProtegida><Estadisticas /></RutaProtegida>} />
        <Route path="/admin/cuestionarios/:id/reportes" element={<RutaProtegida><Reportes /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}
