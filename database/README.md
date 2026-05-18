# 🗄️ Capa de Base de Datos - Sistema de Préstamos UTP
Esta carpeta contiene el diseño, los respaldos y la estrategia de orquestación de la base de datos relacional de nuestro sistema, diseñada bajo un modelo híbrido que soporta tanto desarrollo local rápido como un despliegue de alta disponibilidad en la nube de **Amazon Web Services (AWS)**.

---

## 🚀 Arquitectura y Topología de Datos

Nuestra infraestructura de datos está segmentada en dos entornos para garantizar las mejores prácticas de DevOps y GitOps:

### 1. Entorno de Desarrollo (Local)
*   **Motor**: MySQL 8.0 administrado a través de contenedores locales mediante **Docker** y **Docker Compose**.
*   **Persistencia**: Volumen físico de datos locales montado sobre el host de desarrollo para aislar la información.
*   **ORM**: **Sequelize** (Node.js/TypeScript) encargado de modelar esquemas, indexar relaciones y gestionar transacciones SQL atómicas de forma nativa.

### 2. Entorno de Producción y Alta Disponibilidad (AWS Cloud) 🌐
El motor de datos ha sido migrado a un entorno completamente administrado y escalable en la nube de AWS:
*   **Servicio**: **AWS RDS (Relational Database Service)** instanciando un motor MySQL 8.0 en la región de **us-east-1**.
*   **Beneficios de Nube**: Copias de seguridad automatizadas en ventanas de mantenimiento periódicas, actualizaciones de parches del sistema operativo automáticos y monitorización en tiempo real con Amazon CloudWatch.
*   **Seguridad y Aislamiento Perimetral (Security Groups)**:
    *   La base de datos RDS se encuentra desplegada en subredes privadas aisladas del internet público.
    *   **AWS Security Group (SG)**: El grupo de seguridad de la instancia RDS cuenta con reglas de red entrantes estrictas (Inbound Rules) que **únicamente permiten tráfico por el puerto 3306 proveniente del Security Group específico del Backend (AWS EC2)**. Todo el tráfico entrante directo desde el internet público o IPS externas está denegado por defecto.

---

## 📂 Contenido del Directorio

*   `backup.sql`: Copia de seguridad completa y lista para producción (Estructura de tablas, relaciones, roles, permisos y datos semilla iniciales de inventario y usuarios de prueba).
*   `README.md`: Este archivo explicativo de la topología y despliegue de datos.

---

## 🔄 Estrategia de Migración e Inyección Inicial en AWS RDS

El archivo `backup.sql` actúa como la pieza de datos fundamental para la inicialización y puesta en marcha del entorno de nube.

> [!CAUTION]
> **REGLA DE SEGURIDAD CRÍTICA**: Por políticas de seguridad de la infraestructura de TI, **jamás** se deben incluir credenciales reales, hosts de RDS, ni contraseñas reales en los archivos del repositorio de Git. En su lugar, se utilizan marcadores de posición (`placeholders`).

### 1. Generación del Dump de Datos (Desde Desarrollo Local)
El archivo se exportó desde el contenedor local con el siguiente comando:
```bash
docker exec -i mysql_prestamos mysqldump -u root -p prestamos_utp_db > database/backup.sql
```

### 2. Inyección Inicial en AWS RDS (Seeding en Nube) ☁️
Para poblar la base de datos de producción remota en AWS RDS por primera vez, se ejecuta una inyección remota canalizando el archivo `backup.sql` a través del cliente de MySQL, autenticándote contra el endpoint de Amazon Web Services:

```bash
mysql -h TU_RDS_ENDPOINT.us-east-1.rds.amazonaws.com -u TU_USUARIO -p TU_BASE_DE_DATOS < database/backup.sql
```

*Nota: Para ejecutar la inyección, se recomienda ejecutar el comando localmente habilitando la IP temporalmente en el Security Group de RDS, o realizarlo directamente desde una sesión interactiva SSH dentro de la propia máquina virtual EC2 de backend (la cual posee acceso de red nativo por grupo de seguridad).*
