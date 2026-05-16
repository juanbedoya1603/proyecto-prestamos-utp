// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/database';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares requeridos por la rúbrica
app.use(cors()); // Para permitir peticiones desde el frontend de Angular
app.use(express.json()); // Para entender los body en formato JSON

// Endpoint de prueba (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Función para iniciar el servidor y conectar a la BD
const startServer = async () => {
  try {
    // Verificamos la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Base de datos conectada exitosamente.');
    
    // Levantamos el servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error fatal al conectar con la base de datos:', error);
  }
};

startServer();