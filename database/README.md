# 🗄️ Capa de Base de Datos - Sistema de Préstamos UTP

Esta carpeta contiene el diseño, la documentación y los respaldos (dumps) de la base de datos relacional del proyecto, diseñada para un entorno híbrido (Desarrollo Local -> Producción en Nube).

## 🚀 Arquitectura y Tecnologías

Nuestra arquitectura de datos está dividida en dos entornos para garantizar buenas prácticas de DevOps:

### 1. Entorno de Desarrollo (Local)

- **Motor:** MySQL 8.0 administrado a través de contenedores **Docker**.
- **Persistencia:** Volúmenes de Docker (`db_data`) para mantener la información aislada del código fuente.
- **ORM:** **Sequelize** (Node.js/TypeScript) para el modelado de datos, migraciones y transacciones SQL seguras.

### 2. Entorno de Producción (AWS Cloud)

Para el despliegue en producción, la base de datos migra a la infraestructura de Amazon Web Services cumpliendo con los estándares de alta disponibilidad:

- **Amazon RDS (Relational Database Service):** Instancia administrada de MySQL para garantizar backups automáticos, parches y escalabilidad.
- **AWS Security Groups (Grupos de Seguridad):** La instancia RDS está protegida mediante reglas de red estrictas (Inbound Rules) que **solo permiten tráfico en el puerto 3306 proveniente de nuestras instancias EC2** (donde reside el Backend) y de un Application Load Balancer (ALB). Se deniega todo el tráfico público de internet.

---

## 📂 Contenido del Directorio

- `backup.sql`: Copia de seguridad completa (Estructura y Datos). Contiene las tablas generadas por Sequelize y los datos semilla (`initialData.ts`) necesarios para el arranque del sistema (Superusuario, Roles, Permisos, Categorías y Equipos).
- `.gitkeep`: Archivo de control para el rastreo del directorio en Git.

---

## 🔄 Estrategia de Migración (Local a AWS RDS)

El archivo `backup.sql` es la pieza central para nuestra migración a la nube.

**1. Generar/Actualizar el Backup Local (Export):**

```bash
docker exec -i mysql_prestamos mysqldump -u root -proot1234 prestamos_utp_db > database/backup.sql
```
