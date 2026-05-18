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
*   **Seguridad y Aislamiento Perimetral**:
    *   La base de datos RDS se encuentra desplegada en subredes privadas.
    *   **AWS Security Group (SG)**: El grupo de seguridad de la instancia RDS cuenta con reglas de red entrantes estrictas (Inbound Rules) que **únicamente permiten tráfico por el puerto 3306 proveniente del Security Group específico del Backend (AWS EC2)**. Todo el tráfico entrante directo desde el internet público está completamente denegado.

---

## 📂 Contenido del Directorio

*   `backup.sql`: Copia de seguridad completa y lista para producción (Estructura de tablas, relaciones, roles, permisos y datos semilla iniciales de inventario y usuarios de prueba).
*   `README.md`: Este archivo explicativo de la topología y despliegue de datos.

---

## 🔄 Estrategia de Migración e Inyección Inicial en AWS RDS

El archivo `backup.sql` actuó como la pieza de datos fundamental para la inicialización y puesta en marcha del entorno de nube.

### 1. Generación del Dump de Datos (Desde Desarrollo Local)
El archivo se exportó desde el contenedor local con el siguiente comando:
```bash
docker exec -i mysql_prestamos mysqldump -u root -proot1234 prestamos_utp_db > database/backup.sql
```

### 2. Inyección Inicial en AWS RDS (Seeding en Nube) ☁️
Para poblar la base de datos de producción remota en AWS RDS por primera vez, se ejecutó una inyección remota canalizando el archivo `backup.sql` a través del cliente de MySQL, autenticándonos contra el endpoint DNS provisto por Amazon Web Services:

```bash
mysql -h rds-prestamos-utp-prod.crgyoaqhkkp8.us-east-1.rds.amazonaws.com -u admin -p prestamos_utp_db < database/backup.sql
```

> [!NOTE]
> Para ejecutar esta inyección remota, la máquina local temporal del administrador debió contar con acceso temporal a través del Security Group de RDS, o el script de inyección se ejecutó directamente desde una sesión de consola segura SSH dentro de la propia instancia de backend AWS EC2.
