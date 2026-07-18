-- MIGRACIÓN MAESTRA — corre este único script en el SQL Editor de Neon.
-- Es segura de ejecutar sin importar qué migraciones parciales hayas corrido antes
-- (todo está protegido con IF NOT EXISTS / verificaciones), así que si tienes duda
-- de en qué quedaste, simplemente corre este archivo completo y ya queda al corriente.

-- 1) Columna "tipo" en preguntas (opcion_multiple / escala / libre / completar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'preguntas' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE preguntas ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'opcion_multiple';
    UPDATE preguntas p SET tipo = COALESCE(c.tipo, 'opcion_multiple')
    FROM cuestionarios c WHERE c.id = p.cuestionario_id;
  END IF;
END $$;

-- 2) Columna para respuestas de texto (libre y completar)
ALTER TABLE respuestas ADD COLUMN IF NOT EXISTS texto_respuesta TEXT;

-- 3) El tipo del cuestionario ya no es obligatorio (ahora vive en cada pregunta)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cuestionarios' AND column_name = 'tipo' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE cuestionarios ALTER COLUMN tipo DROP NOT NULL;
  END IF;
END $$;

-- 4) Restricción del tipo de pregunta: permite opcion_multiple, escala, libre y completar
DO $$
DECLARE nombre_restriccion text;
BEGIN
  SELECT con.conname INTO nombre_restriccion
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'preguntas' AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%tipo%';
  IF nombre_restriccion IS NOT NULL THEN
    EXECUTE format('ALTER TABLE preguntas DROP CONSTRAINT %I', nombre_restriccion);
  END IF;
END $$;

ALTER TABLE preguntas ADD CONSTRAINT preguntas_tipo_check
  CHECK (tipo IN ('opcion_multiple', 'escala', 'libre', 'completar'));

-- 5) Respuesta correcta configurable (para escala, libre y completar; opción múltiple
--    ya usa opciones.es_correcta y no necesita esto)
ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS respuesta_correcta TEXT;

-- Verificación final — deberías ver 3 filas (tipo, texto_respuesta, respuesta_correcta)
SELECT table_name, column_name FROM information_schema.columns
WHERE (table_name = 'preguntas' AND column_name IN ('tipo', 'respuesta_correcta'))
   OR (table_name = 'respuestas' AND column_name = 'texto_respuesta');
