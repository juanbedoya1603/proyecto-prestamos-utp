import { Request, Response } from 'express';
import { Category } from '../models';

// GET /api/categories
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error });
  }
};
