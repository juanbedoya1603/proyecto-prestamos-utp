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
├── tsconfig.json        # Configuración estricta del compilador de TS
└── package.json         # Dependencias del servidor y scripts de desarrollo
```

---

## ⚙️ Configuración de Variables de Entorno (`.env`)

El servidor depende estrictamente de configuraciones externas inyectadas mediante variables de entorno para evitar prácticas inseguras de hardcoding. Duplica el archivo `.env.example` y edita las siguientes llaves en tu `.env` local:

```env
# Puerto del Servidor Express
PORT=3000

# Parámetros de Conexión MySQL (Dockerizado o Nube AWS RDS)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root1234
DB_NAME=prestamos_utp_db
DB_PORT=3306

# Firmas de Seguridad Criptográfica JWT
JWT_ACCESS_SECRET=clave_secreta_super_segura_de_acceso_utp
JWT_REFRESH_SECRET=clave_secreta_super_segura_de_actualizacion_utp
```

---

## 🔒 Capa de Seguridad y RBAC (Control de Acceso basado en Roles)

El sistema de seguridad implementa:
1.  **JWT Rotativo**:
    *   **Access Token**: Tiempo de vida de 15 minutos. Contiene la firma y los datos de identidad básicos (`id`, `email`, `roleId`, `roleName`).
    *   **Refresh Token**: Almacenado de forma segura en una tabla de base de datos (`refresh_tokens`) con expiración de 7 días. Permite al frontend obtener un nuevo access token de forma transparente sin forzar al usuario a loguearse constantemente.
2.  **Encriptación Bcrypt**: Todas las contraseñas se almacenan mediante hashes criptográficos salteados con `bcryptjs` en 10 rondas. Jamás viajan hashes de retorno ni contraseñas planas en las respuestas JSON.
3.  **Middleware RBAC**:
    *   [authMiddleware.ts](file:///c:/Users/bedoy/OneDrive/Desktop/Programacion/Progra%20WEB/Proyecto%20Final%20Web/proyecto-prestamos-utp/backend/src/middlewares/authMiddleware.ts) intercepta los requests, extrae y descifra el JWT, y evalúa a nivel de base de datos si el rol del usuario posee los permisos requeridos para acceder a la ruta.

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
