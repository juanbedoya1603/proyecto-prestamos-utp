// src/controllers/loanController.ts
import { Response } from 'express';
import { AuthRequest } from '../types';
import { Loan, Equipment, User } from '../models';
import sequelize from '../config/database';

/**
 * ── POST /api/loans ──────────────────────────────────────────────────
 * Crea un nuevo préstamo de equipo.
 * Solo si el equipo está 'available'.
 * ─────────────────────────────────────────────────────────────────────
 */
export const createLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  const { equipmentId, returnDate, userId: bodyUserId } = req.body;
  const requesterId = req.user!.id;
  const roleName = req.user!.roleName;

  if (!equipmentId || !returnDate) {
    res.status(400).json({ message: 'Equipo y fecha de devolución son requeridos' });
    return;
  }

  // Validar que la fecha de devolución no sea anterior a hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedReturn = new Date(returnDate);
  if (isNaN(parsedReturn.getTime()) || parsedReturn < today) {
    res.status(400).json({ message: 'La fecha de devolución debe ser una fecha futura' });
    return;
  }

  // Determinar a quién se le asigna el préstamo
  let targetUserId = requesterId;
  if (bodyUserId && Number(bodyUserId) !== requesterId) {
    if (roleName !== 'admin' && roleName !== 'superuser') {
      res.status(403).json({ message: 'No tienes permiso para asignar préstamos a otros usuarios' });
      return;
    }
    targetUserId = Number(bodyUserId);
  }

  const t = await sequelize.transaction();
  try {
    const equipment = await Equipment.findByPk(Number(equipmentId), { transaction: t });

    if (!equipment) {
      await t.rollback();
      res.status(404).json({ message: 'El equipo especificado no existe' });
      return;
    }

    if (equipment.status !== 'available') {
      await t.rollback();
      res.status(400).json({ message: `El equipo no está disponible para préstamo. Estado actual: ${equipment.status}` });
      return;
    }

    const newLoan = await Loan.create({
      userId: targetUserId, // 🟢 Usamos el targetUserId calculado
      equipmentId: Number(equipmentId),
      returnDate,
      status: 'active',
      loanDate: new Date(),
    }, { transaction: t });

    await equipment.update({ status: 'borrowed' }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Préstamo registrado exitosamente', loan: newLoan });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error al registrar el préstamo', error });
  }
};

/**
 * ── PUT /api/loans/:id/return ────────────────────────────────────────
 * Registra la devolución de un equipo.
 * ─────────────────────────────────────────────────────────────────────
 */
export const returnLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { observations } = req.body || {};
    const userId = req.user!.id;
    const roleName = req.user!.roleName;

    // 1. Buscar el préstamo
    const loan = await Loan.findByPk(Number(id), { transaction: t });

    if (!loan) {
      await t.rollback();
      res.status(404).json({ message: 'Préstamo no encontrado' });
      return;
    }

    // 2. Validar propiedad (dueño del préstamo o admin/superuser)
    const isAdmin = roleName === 'admin' || roleName === 'superuser';
    if (loan.userId !== userId && !isAdmin) {
      await t.rollback();
      res.status(403).json({ message: 'No tienes permiso para devolver este préstamo' });
      return;
    }

    if (loan.status === 'returned') {
      await t.rollback();
      res.status(400).json({ message: 'Este préstamo ya fue devuelto' });
      return;
    }

    // 3. Actualizar el préstamo
    await loan.update({
      status: 'returned',
      returnDate: new Date(),
      observations: observations || loan.observations,
    }, { transaction: t });

    // 4. Actualizar el estado del equipo a 'available'
    const equipment = await Equipment.findByPk(Number(loan.equipmentId), { transaction: t });
    if (equipment) {
      await equipment.update({ status: 'available' }, { transaction: t });
    }

    await t.commit();
    res.status(200).json({
      message: 'Equipo devuelto exitosamente',
      loan,
    });
  } catch (error) {
    await t.rollback();
    // 1. Imprimimos el error rojo gigante en la terminal para que lo veas tú
    console.error('🔥 ERROR CRÍTICO EN DEVOLUCIÓN:', error);
    
    // 2. Le mandamos el mensaje de error explícito a Postman
    const err = error as Error;
    res.status(500).json({ 
      message: 'Error al procesar la devolución', 
      error: err.message,
      stack: err.stack // Opcional: te dirá exactamente la línea del código que falló
    });
  }
};

/**
 * ── GET /api/loans/my-loans ─────────────────────────────────────────
 * Lista los préstamos del usuario autenticado.
 * ─────────────────────────────────────────────────────────────────────
 */
export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const loans = await Loan.findAll({
      where: { userId: Number(userId) },
      include: [{ model: Equipment, as: 'equipment' }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus préstamos', error });
  }
};

/**
 * ── GET /api/loans ──────────────────────────────────────────────────
 * Lista todos los préstamos del sistema (Admin/Superuser).
 * ─────────────────────────────────────────────────────────────────────
 */
export const getAllLoans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Equipment, as: 'equipment' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todos los préstamos', error });
  }
};
