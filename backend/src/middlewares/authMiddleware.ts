// src/middlewares/authMiddleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, Permission } from '../models';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: number;
  email: string;
  roleId: number;
  roleName: string;
}

// Verifica que el JWT sea válido
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
    req.user = { id: payload.id, email: payload.email, roleId: payload.roleId, roleName: payload.roleName };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Verifica que el rol tenga el permiso en la base de datos
export const authorize = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const role = await Role.findOne({
      where: { id: req.user.roleId },
      include: [
        {
          model: Permission,
          as: 'permissions',
          where: { name: permissionName },
          through: { attributes: [] },
          required: true,
        },
      ],
    });
    if (!role) {
      res.status(403).json({ message: `No tienes permiso para realizar esta acción (${permissionName})` });
      return;
    }
    next();
  };
};

export const hasPermission = async (roleId: number, permissionName: string): Promise<boolean> => {
  const role = await Role.findOne({
    where: { id: roleId },
    include: [{ model: Permission, as: 'permissions', where: { name: permissionName }, through: { attributes: [] }, required: true }],
  });
  return role !== null;
};