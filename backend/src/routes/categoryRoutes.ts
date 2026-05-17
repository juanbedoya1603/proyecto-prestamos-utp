import { Router } from 'express';
import { getAllCategories } from '../controllers/categoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de categorías requieren que el usuario esté logueado
router.use(authenticate);

// GET /api/categories
router.get('/', getAllCategories);

export default router;
