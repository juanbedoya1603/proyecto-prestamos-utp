// src/routes/loanRoutes.ts
import { Router } from 'express';
import { 
  createLoan, 
  returnLoan, 
  getMyLoans, 
  getAllLoans 
} from '../controllers/loanController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de préstamos requieren autenticación
router.use(authenticate);

// POST /api/loans -> Crear un préstamo (Requiere permiso loans:create)
router.post('/', authorize('loans:create'), createLoan);

// GET /api/loans/my-loans -> Ver mis préstamos (Requiere permiso loans:read)
router.get('/my-loans', authorize('loans:read'), getMyLoans);

// PUT /api/loans/:id/return -> Devolver un equipo (Requiere permiso loans:create)
router.put('/:id/return', authorize('loans:create'), returnLoan);

// GET /api/loans -> Ver todos los préstamos (Solo admins con equipments:read o similar)
router.get('/', authorize('equipments:read'), getAllLoans);

export default router;
