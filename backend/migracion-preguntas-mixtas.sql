-- Migración: preguntas mixtas (opción múltiple, escala, libre) dentro de un mismo cuestionario
-- Ejecutar UNA VEZ en el SQL Editor de Neon

ALTER TABLE preguntas
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'opcion_multiple'
  CHECK (tipo IN ('opcion_multiple', 'escala', 'libre'));

-- Rellena el tipo de las preguntas ya existentes según el tipo que tenía su cuestionario
UPDATE preguntas p SET tipo = c.tipo
FROM cuestionarios c
WHERE c.id = p.cuestionario_id;

-- Las respuestas de tipo "libre" necesitan guardar texto, no una opción ni un número
ALTER TABLE respuestas ADD COLUMN IF NOT EXISTS texto_respuesta TEXT;

-- El tipo del cuestionario ya no es obligatorio (ahora vive en cada pregunta)
ALTER TABLE cuestionarios ALTER COLUMN tipo DROP NOT NULL;
