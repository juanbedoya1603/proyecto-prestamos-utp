import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/refresh', refresh);

// Rutas protegidas
router.post('/logout', authenticate, logout);

export default router;