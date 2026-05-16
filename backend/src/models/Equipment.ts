// src/models/Equipment.ts
// ============================================================
// Modelo de la tabla `equipments`
// Representa el inventario físico que se va a prestar.
// ============================================================

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interfaz con todas las columnas de la tabla
interface EquipmentAttributes {
  id: number;
  name: string;
  serialNumber: string;
  status: 'available' | 'borrowed' | 'maintenance';
  categoryId: number; // FK -> tabla categories
  createdAt?: Date;
  updatedAt?: Date;
}

// Al crear un equipo, el id lo genera la BD y el status tiene un valor por defecto
type EquipmentCreationAttributes = Optional<EquipmentAttributes, 'id' | 'status'>;

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: number;
  public name!: string;
  public serialNumber!: string;
  public status!: 'available' | 'borrowed' | 'maintenance';
  public categoryId!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    serialNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // No pueden haber dos equipos físicos con el mismo serial
    },
    status: {
      type: DataTypes.ENUM('available', 'borrowed', 'maintenance'),
      defaultValue: 'available', // Por defecto, todo equipo nuevo entra disponible
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'equipments',
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

export default Equipment;