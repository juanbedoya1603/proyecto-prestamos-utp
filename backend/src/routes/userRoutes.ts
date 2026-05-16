import { Router } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de usuarios requieren estar logueado
router.use(authenticate);

// Rutas protegidas por permisos específicos del profesor
router.post('/', authorize('users:create'), createUser);
router.get('/', authorize('users:read'), getAllUsers);
router.get('/:id', getUserById); // La validación interna revisa si es su propio perfil
router.put('/:id', updateUser); // La validación interna revisa si es su propio perfil
router.delete('/:id', authorize('users:delete'), deleteUser);

export default router;