# 🎨 Cliente Web - Frontend (Angular 19 + Angular Material)
Este directorio contiene la aplicación cliente (SPA) desarrollada sobre la arquitectura de última generación de **Angular 19**. La aplicación destaca por un diseño premium de interfaz, micro-animaciones fluidas con Angular Animations, retroalimentación táctil de carga y un modelo de datos altamente reactivo e inmune a filtraciones de memoria.

---

## 📂 Estructura Modular de Features

La aplicación se estructura siguiendo el principio de diseño modular basado en dominio y funcionalidades (**Features**):

```text
front/src/app/
├── core/                # Elementos globales e infraestructura
│   ├── auth/            # Servicio de autenticación, almacenamiento local e interfaces
│   └── guards/          # Guardianes de enrutamiento basados en sesión JWT
├── layout/              # Estructura visual contenedora (Sidenav, Topbar, Footer)
├── features/            # Módulos de funcionalidad e interfaces de usuario
│   ├── dashboard/       # Panel con métricas dinámicas computadas en tiempo real
│   ├── equipments/      # Tabla de inventario y diálogos de administración
│   ├── loans/           # Tabla de historial y diálogos de préstamos/devolución
│   └── users/           # Servicios y tipos específicos de usuarios
├── app.config.ts        # Proveedores de Angular (Material, Animaciones, Interceptores HTTP)
└── app.routes.ts        # Enrutador declarativo standalone
```

---

## 🚀 Paradigmas y APIs de Angular 19 Implementados

### 1. Componentes Standalone (Sin `NgModule`)
Toda la aplicación se compone de componentes independientes (**Standalone Components**). Esto elimina la necesidad de declarar módulos pesados (`NgModules`), simplifica el árbol de importaciones y acelera el tiempo de renderización inicial del bundle.

### 2. Estado Reactivo con Signals
El manejo de estado de la aplicación reside en la nueva API de **Signals** de Angular. Los signals representan valores reactivos que notifican automáticamente al framework cuando ocurren cambios de datos, reduciendo la sobrecarga de ciclos de detección de cambios clásicos (`Zones`).
*   *Ejemplo de uso*: `isLoading = signal(false);` que controla la deshabilitación y spinners de carga en tiempo de ejecución.

### 3. Estado Derivado en Caliente con `computed()`
Para operaciones complejas y dinámicas que dependen de otros estados, empleamos el operador **`computed()`** de Angular 19. Este se recalcula automáticamente y de forma óptima en caché cuando sus signals dependientes se actualizan.
*   **Métricas del Dashboard**: En [dashboard.component.ts](file:///c:/Users/bedoy/OneDrive/Desktop/Programacion/Progra%20WEB/Proyecto%20Final%20Web/proyecto-prestamos-utp/front/src/app/features/dashboard/dashboard.component.ts), las señales de conteo total de inventario y equipos disponibles se calculan de manera reactiva mediante expresiones computadas:
    ```typescript
    activeLoansCount = computed(() => this.loans().filter(l => l.status === 'active').length);
    ```
*   **Tablas Adaptativas basadas en Permisos**: En [equipment-list.component.ts](file:///c:/Users/bedoy/OneDrive/Desktop/Programacion/Progra%20WEB/Proyecto%20Final%20Web/proyecto-prestamos-utp/front/src/app/features/equipments/equipment-list/equipment-list.component.ts), la columna de "Acciones" (Editar y Eliminar) se añade o remueve dinámicamente de la tabla HTML utilizando un `computed` basado en el rol actual del usuario logueado. Si no es administrador, la columna y los botones de control son eliminados físicamente del DOM.

### 4. Flujo de Control Moderno (`@if`, `@for`)
Hemos erradicado por completo el uso de las antiguas directivas estructurales `*ngIf` y `*ngFor`. En su lugar, el proyecto utiliza la sintaxis declarativa nativa de Angular 19:
*   **Velocidad de Renderizado**: La nueva sintaxis de flujo de control es hasta un 30% más rápida en compilación.
*   **Legibilidad Insuperable**:
    ```html
    @for (user of users(); track user.id) {
      <mat-option [value]="user.id">{{ user.name }}</mat-option>
    } @empty {
      <mat-option disabled>No hay usuarios registrados</mat-option>
    }
    ```

---

## 🔒 Flujo del Cliente e Interceptores HTTP

1.  **Protección de Enrutamiento (`Guards`)**: Las rutas críticas (`/dashboard`, `/equipments`, `/loans`) están bloqueadas bajo el guardián `authGuard` que verifica si el usuario posee un token activo en memoria o en `localStorage`.
2.  **Inyección Automática de Tokens (`Interceptor`)**: Cada petición HTTP de salida es capturada por el interceptor global de Angular Material. Este lee el `accessToken` del `AuthService` y lo inyecta automáticamente en la cabecera `Authorization: Bearer <TOKEN>` para que el backend valide el request sin interferencia manual.
3.  **Prevención de Doble Envío (`Double-Submit Blocker`)**: Los diálogos de préstamos y de inventario gestionan una señal de carga `isLoading`. Al hacer clic en guardar, los botones se deshabilitan instantáneamente y se muestra un loader animado de Material, evitando peticiones duplicadas accidentales del cliente mientras el backend procesa las transacciones SQL.

---

## 📅 Validación de Fechas en Formulario
El formulario de préstamo de equipos implementa una validación doble:
*   **Límite Mínimo (`minDate`)**: Se declara una propiedad `minDate = new Date();` enlazada en el HTML al atributo `[min]` del Datepicker de Angular Material. Esto inhabilita físicamente la selección de cualquier fecha anterior a hoy en el calendario interactivo.
*   **Filtros de Inventario**: Al abrir el formulario de préstamos, el componente filtra automáticamente los equipos consultados por el servicio, mostrando en el dropdown únicamente aquellos que poseen estado `'available'`.

---

## ☁️ Despliegue en Producción (AWS S3)

Para el despliegue del Frontend en alta disponibilidad, el cliente Angular se aloja de forma estática en la nube de Amazon Web Services:

### 1. Compilación de Producción
Se ejecuta el empaquetado del bundle optimizado para web:
```bash
npm run build
```
Esto genera los artefactos minificados HTML, JS compilado y estilos optimizados dentro del directorio `/dist/front`.

### 2. AWS S3 Static Website Hosting
*   Los contenidos de `/dist/front` se cargan a tu bucket de **Amazon S3** dedicado para producción (`s3://nombre-tu-bucket-front`).
*   Se habilita la opción **Static website hosting** configurando tanto el "Index document" como el "Error document" hacia `index.html`. Esto es crítico para soportar correctamente el enrutamiento del lado del cliente de Angular (HTML5 pushState) al refrescar el navegador.
*   Se inyecta una **Bucket Policy** en S3 para permitir solicitudes de lectura pública:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::nombre-tu-bucket-front/*"
        }
      ]
    }
    ```

### 3. Conexión de API al Application Load Balancer (ALB) 📡
En el entorno de nube, las peticiones HTTP de los servicios Angular ya no apuntan a `localhost:3000`. Se deben configurar en los archivos de servicio de Angular (`auth.service.ts`, `equipment.service.ts`, `loan.service.ts`, y `user.service.ts`) para apuntar al **DNS público de tu balanceador de carga (ALB) de AWS**:

*   **Endpoint Base de API en Producción**:  
    `http://TU-ALB-DNS-AWS.amazonaws.com`

> [!WARNING]
> **REGLA DE SEGURIDAD**: Nunca expongas endpoints DNS reales con IDs de cuentas, secretos de red ni URLs sensibles en el repositorio de Git. Utiliza siempre marcadores genéricos en la documentación pública.

---

## 🚀 Comandos y Guía de Desarrollo

Navega al directorio `front` y ejecuta:

### Servidor de Desarrollo Local
Inicia el compilador en tiempo real con recarga automática:
```bash
npm start
```
*La aplicación estará accesible localmente en: `http://localhost:4200/`*
