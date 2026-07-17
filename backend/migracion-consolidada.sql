-- Migración consolidada — segura de correr aunque ya hayas aplicado una versión anterior.
-- Deja la base de datos lista para: opción múltiple, escala, libre y completar-oración.

-- 1) Columna "tipo" en preguntas (solo la crea si todavía no existe)
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
ALTER TABLE cuestionarios ALTER COLUMN tipo DROP NOT NULL;

-- 4) Actualiza la restricción para permitir el nuevo tipo "completar"
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
