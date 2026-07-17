-- Esquema de base de datos: Cuestionarios SITT
-- Ejecutar una sola vez en Neon (SQL Editor o psql)

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cuestionarios (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('opcion_multiple', 'escala')),
  tiempo_estimado_min INT DEFAULT 3,
  activo BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preguntas (
  id SERIAL PRIMARY KEY,
  cuestionario_id INT NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  imagen_url TEXT,
  imagen_public_id TEXT,
  orden INT NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opciones (
  id SERIAL PRIMARY KEY,
  pregunta_id INT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  letra CHAR(1) NOT NULL,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  orden INT NOT NULL DEFAULT 0
);

-- Cada "llenado" anónimo de un cuestionario
CREATE TABLE IF NOT EXISTS sesiones (
  id SERIAL PRIMARY KEY,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  cuestionario_id INT NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT false,
  iniciado_en TIMESTAMP DEFAULT NOW(),
  completado_en TIMESTAMP
);

CREATE TABLE IF NOT EXISTS respuestas (
  id SERIAL PRIMARY KEY,
  sesion_id INT NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  pregunta_id INT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  opcion_id INT REFERENCES opciones(id),
  valor_escala INT CHECK (valor_escala BETWEEN 1 AND 10),
  creado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(sesion_id, pregunta_id)
);

CREATE INDEX IF NOT EXISTS idx_preguntas_cuestionario ON preguntas(cuestionario_id);
CREATE INDEX IF NOT EXISTS idx_opciones_pregunta ON opciones(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_cuestionario ON sesiones(cuestionario_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_sesion ON respuestas(sesion_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta ON respuestas(pregunta_id);

-- Necesario para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
