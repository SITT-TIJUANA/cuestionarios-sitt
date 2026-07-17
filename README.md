# Cuestionarios SITT

Sistema de cuestionarios anónimos (opción múltiple con imágenes, o escala 1-10)
con panel administrativo. Pensado para escanear un QR y contestar desde el celular.

## Estructura
- `backend/` — API Node + Express, se despliega en Render
- `frontend/` — React + Vite, se despliega en GitHub Pages

## 1. Base de datos (Neon)
1. Crea un proyecto en https://neon.tech (gratis)
2. Abre el "SQL editor" y pega el contenido de `backend/schema.sql`, ejecútalo
3. Copia el "Connection string" (`DATABASE_URL`)

## 2. Cloudinary
1. Crea cuenta en https://cloudinary.com (gratis)
2. En el dashboard copia: Cloud name, API Key, API Secret

## 3. Backend en Render
1. Sube la carpeta `backend/` a un repo de GitHub (o subcarpeta del mismo repo)
2. En Render: New → Web Service → conecta el repo, root directory `backend`
3. Build command: `npm install` — Start command: `npm start`
4. Agrega las variables de entorno (ver `backend/.env.example`):
   - `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Una vez desplegado, copia la URL pública (ej. `https://cuestionarios-sitt.onrender.com`)

### Crear tu usuario admin
Desde tu máquina, con las variables de entorno de Render en un `.env` local:
```
cd backend
npm install
node crear-admin.js jair tu-contraseña
```

## 4. Frontend en GitHub Pages
1. En el repo, ve a Settings → Secrets → Actions y agrega `VITE_API_URL` con la URL de Render
2. Settings → Pages → Source: "GitHub Actions"
3. Sube la carpeta `frontend/` (y `.github/workflows/deploy.yml`) al repo, rama `main`
4. Cada push a `frontend/` dispara el deploy automático

## 5. Uso
- Empleados: `https://tu-usuario.github.io/cuestionarios-sitt/` → genera un QR apuntando aquí
- Admin: `https://tu-usuario.github.io/cuestionarios-sitt/admin/login`

## Notas
- Render free se "duerme" tras 15 min sin uso (primera carga puede tardar ~30-50 seg)
- Solo un cuestionario puede estar "activo" a la vez — es el que ven los empleados al entrar
- Las respuestas son anónimas: se agrupan por un token de sesión, sin ligarlas a ningún dato personal
