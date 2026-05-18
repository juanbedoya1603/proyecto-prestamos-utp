# 🖥️ Servidor de API REST - Backend (Node.js + Express + TypeScript)
Este directorio contiene toda la lógica de negocio, reglas de seguridad, capa de persistencia de datos (ORM Sequelize) y validación estricta del sistema de préstamos. Está desarrollado enteramente en **TypeScript bajo Modo Estricto** (sin usar el tipo destructivo `any`), lo cual garantiza una robustez de compilación insuperable.

---

## 📂 Estructura del Proyecto

El backend está diseñado bajo el patrón arquitectónico de capas para garantizar la mantenibilidad y modularidad:

```text
backend/
├── src/
│   ├── config/          # Configuración de base de datos y Sequelize
│   ├── controllers/     # Controladores (Lógica y Orquestación de Negocio)
│   ├── middlewares/     # Middlewares de Express (Autenticación y RBAC)
│   ├── models/          # Modelos de Sequelize (Esquemas de Base de Datos relacional)
│   ├── routes/          # Enrutadores de Express (Definición de Endpoints)
│   ├── seeders/         # Datos semilla iniciales (Poblamiento de tablas maestro)
│   ├── types/           # Interfaces y declaraciones de tipos custom de TypeScript
│   └── app.ts           # Inicializador principal y montaje de middlewares de Express
├── Dockerfile           # Receta de empaquetado Docker para producción (Node 18 Alpine)
├── tsconfig.json        # Configuración estricta del compilador de TS
└── package.json         # Dependencias del servidor y scripts de desarrollo
```

---

## ⚙️ Configuración Segura de Variables de Entorno

El servidor depende estrictamente de configuraciones externas inyectadas mediante variables de entorno para evitar prácticas inseguras de hardcoding de credenciales. 

> [!IMPORTANT]
> **REGLA DE SEGURIDAD CRÍTICA**: Por directriz de seguridad del proyecto, el archivo `.env` está estrictamente ignorado en `.gitignore` y **nunca** debe ser subido al repositorio de Git. En su lugar, el repositorio provee el archivo [`.env.example`](file:///c:/Users/bedoy/OneDrive/Desktop/Programacion/Progra%20WEB/Proyecto%20Final%20Web/proyecto-prestamos-utp/backend/.env.example) con llaves vacías.

### Instrucciones de Configuración Local y Producción:
Cada desarrollador debe copiar el archivo `.env.example` y crear su propio archivo `.env` en la carpeta `backend/`:
```bash
cp .env.example .env
```

### Variables requeridas en el archivo `.env`:

| Variable | Tipo | Propósito / Configuración |
| :--- | :--- | :--- |
| **`PORT`** | Numérico | Puerto de escucha local de la API (Ej: `3000`). |
| **`DB_HOST`** | String | IP o Endpoint DNS del motor MySQL (En local: `127.0.0.1`. En producción: **Endpoint DNS de tu instancia AWS RDS**). |
| **`DB_PORT`** | Numérico | Puerto de conexión a la base de datos (Por defecto `3306`). |
| **`DB_USER`** | String | Usuario de base de datos (En local: `root`. En producción: usuario administrador creado en RDS). |
| **`DB_PASSWORD`** | String | Contraseña de conexión. **Usa siempre contraseñas seguras y nunca vacías**. |
| **`DB_NAME`** | String | Nombre del esquema SQL a conectar. |
| **`JWT_ACCESS_SECRET`** | String | Firma criptográfica para los Access Tokens de sesión. |
| **`JWT_REFRESH_SECRET`**| String | Firma criptográfica para la rotación de Refresh Tokens. |

---

## 🔒 Capa de Seguridad y Red en AWS (Producción)

En el entorno real de producción sobre AWS, el servidor implementa una topología de red protegida:

1.  **Protección de Puerto 3000 (EC2)**: La instancia de cómputo **AWS EC2** que ejecuta la API mantiene el puerto `3000` cerrado al internet público. 
2.  **Application Load Balancer (ALB)**: Todo el tráfico entrante pasa de forma obligatoria por un **AWS ALB** público (puerto 80 HTTP). El grupo de seguridad de la EC2 solo permite tráfico por el puerto `3000` si proviene directamente de la dirección interna del ALB.
3.  **Seguridad Criptográfica**: Las contraseñas de usuarios están protegidas por hashes salteados con `bcryptjs` en 10 rondas. Los JWT gestionan tokens de acceso de corta duración (15 min) y tokens de refresco de larga duración (7 días) para garantizar sesiones fluidas pero seguras.

---

## 🐳 Dockerización y Orquestación en AWS EC2

Para garantizar portabilidad idéntica entre entornos de desarrollo y nube, el backend fue dockerizado:

### 1. Receta del `Dockerfile` (Node 18 Alpine)
El archivo empaqueta el servidor minimizando la huella del contenedor en disco y memoria:
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Orquestación en Nube via Docker Compose
En la máquina virtual EC2, el contenedor y sus políticas de reinicio automático se controlan mediante `docker-compose.yml`:
```yaml
services:
  api:
    build: ./backend
    container_name: prestamos_backend_api
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env
    restart: always
```

---

## 📊 Catálogo Completo de Endpoints

### 🔐 1. Módulo de Autenticación (`/api/auth`)
*   **`POST /api/auth/login`**: Inicia sesión.
    *   *Payload*: `{ "email": "super@admin.com", "password": "..." }`
    *   *Respuesta (200 OK)*: Devuelve el `accessToken`, `refreshToken` y la información básica de rol.
*   **`POST /api/auth/refresh`**: Genera un nuevo Access Token.
    *   *Payload*: `{ "refreshToken": "..." }`
    *   *Respuesta (200 OK)*: Nuevo `{ "accessToken": "..." }`.

### 🗂️ 2. Módulo de Categorías (`/api/categories`)
*   **`GET /api/categories`**: Devuelve todas las categorías maestras creadas en la base de datos (Ej: Electrónica, Audiovisuales).
    *   *Seguridad*: Requiere autenticación.
    *   *Uso*: Consumido dinámicamente por el frontend para poblar formularios sin datos hardcodeados.

### 💻 3. Módulo de Inventario de Equipos (`/api/equipments`)
*   **`GET /api/equipments`**: Lista todo el inventario con sus respectivas categorías asignadas.
    *   *Seguridad*: Permiso `equipments:read` (Disponible para Administradores, Superusuarios y Estudiantes).
*   **`POST /api/equipments`**: Registra un nuevo equipo.
    *   *Seguridad*: Permiso `equipments:create` (Administradores y Superusuarios).
    *   *Validación*: Valida campos no vacíos, comprueba que la categoría exista en la BD (404) y bloquea colisiones de números de serie repetidos (409 Conflict).
*   **`PUT /api/equipments/:id`**: Actualiza campos del equipo.
    *   *Seguridad*: Permiso `equipments:update`.
    *   *Validación*: Comprueba existencia del equipo, validador de enums de estado (`'available' | 'borrowed' | 'maintenance'`), unicidad de serial y existencia de categoría asignada.
*   **`DELETE /api/equipments/:id`**: Elimina un equipo.
    *   *Seguridad*: Permiso `equipments:delete`.
    *   *Validación*: **Regla de Negocio Estricta**. Si el equipo está en préstamo (`'borrowed'`), el backend bloquea la eliminación arrojando un `400 Bad Request`.

### 📝 4. Módulo de Préstamos (`/api/loans`)
*   **`GET /api/loans`**: Lista todos los préstamos registrados (con datos de usuario y equipo).
    *   *Seguridad*: Permiso `loans:read` (Admin/Superuser).
*   **`GET /api/loans/my-loans`**: Lista de préstamos **únicamente** del usuario autenticado de la sesión.
    *   *Seguridad*: Autenticado (Estudiantes y Administradores por igual, aislados de forma segura).
*   **`POST /api/loans`**: Solicita un préstamo.
    *   *Payload*: `{ "equipmentId": 2, "returnDate": "2026-05-20T00:00:00.000Z", "userId": 2 }` (userId opcional).
    *   *Seguridad*: Permiso `loans:create`.
    *   *Lógica de Negocio y Robustez*:
        1.  **Validación Temporal**: Si `returnDate` es en el pasado, arroja `400 Bad Request`.
        2.  **Asignación Inteligente**: Si un estudiante envía la petición, se ignora cualquier `userId` en el cuerpo y se asigna su ID extraído del token de sesión JWT. Si un Administrador envía un `userId` diferente al suyo, se valida que sea administrador y se asigna dinámicamente al estudiante de destino.
        3.  **Transacción Atómica SQL**: Abre una transacción en Sequelize. Busca el equipo, comprueba que esté en estado `'available'`. Si es así, crea el préstamo y cambia el estado del equipo a `'borrowed'`. Si alguna consulta falla, ejecuta `await t.rollback()` de forma automática manteniendo la base de datos íntegra.
*   **`PUT /api/loans/:id/return`**: Devuelve un equipo.
    *   *Payload*: `{ "observations": "Devuelto en perfectas condiciones" }`
    *   *Lógica*: Transacción atómica. Modifica el estado del préstamo a `'returned'` y libera el equipo poniéndolo de nuevo en `'available'`.

### 👥 5. Módulo de Usuarios (`/api/users`)
*   **`GET /api/users`**: Lista todos los usuarios registrados (Nombre, Email, Rol).
    *   *Seguridad*: Permiso `users:read` (Admin/Superuser). Usado para poblar el selector de "Prestar a".
