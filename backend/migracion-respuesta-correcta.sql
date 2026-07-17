-- Permite marcar la "respuesta correcta" en preguntas de completar, libre y escala
-- (opción múltiple ya usa opciones.es_correcta, no necesita esto)
ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS respuesta_correcta TEXT;
