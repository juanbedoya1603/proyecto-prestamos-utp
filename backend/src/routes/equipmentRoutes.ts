// src/routes/equipmentRoutes.ts
import { Router } from 'express';
import { getAllEquipments, createEquipment } from '../controllers/equipmentController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de equipos requieren que el usuario esté logueado (tenga un JWT válido)
router.use(authenticate);

// GET /api/equipments -> Requiere el permiso 'equipments:read' (asignado a user, admin y superuser)
router.get('/', authorize('equipments:read'), getAllEquipments);

// POST /api/equipments -> Requiere el permiso 'equipments:create' (asignado a admin y superuser)
router.post('/', authorize('equipments:create'), createEquipment);

export default router;