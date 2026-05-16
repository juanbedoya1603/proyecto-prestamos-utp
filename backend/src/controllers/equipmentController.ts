// src/controllers/equipmentController.ts
import { Request, Response } from 'express';
import { Equipment, Category } from '../models';

// ── GET /api/equipments ────────────────────────────────────────────
// Lista todos los equipos. Incluye el nombre de la categoría.
export const getAllEquipments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const equipments = await Equipment.findAll({
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el inventario de equipos', error });
  }
};

// ── POST /api/equipments ───────────────────────────────────────────
// Crea un nuevo equipo.
export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, serialNumber, categoryId } = req.body;

    // Validación 1: Campos requeridos (Código 400 - Bad Request)
    if (!name || !serialNumber || !categoryId) {
      res.status(400).json({ message: 'Nombre, número de serie y categoría son requeridos' });
      return;
    }

    // Validación 2: Serial único (Código 409 - Conflict)
    const existing = await Equipment.findOne({ where: { serialNumber } });
    if (existing) {
      res.status(409).json({ message: 'Ya existe un equipo con ese número de serie' });
      return;
    }

    // Validación 3: La categoría debe existir (Código 404 - Not Found)
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: 'La categoría especificada no existe' });
      return;
    }

    const newEquipment = await Equipment.create({ name, serialNumber, categoryId });
    
    // Código 201 - Created
    res.status(201).json({
      message: 'Equipo registrado exitosamente',
      equipment: newEquipment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el equipo', error });
  }
};