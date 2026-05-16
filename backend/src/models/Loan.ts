import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface LoanAttributes {
  id: number;
  userId: number;      // FK
  equipmentId: number; // FK
  loanDate: Date;
  returnDate: Date;
  status: 'active' | 'returned' | 'overdue';
  observations: string;
}

type LoanCreationAttributes = Optional<LoanAttributes, 'id'>;

class Loan extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
  public id!: number;
  public userId!: number;
  public equipmentId!: number;
  public loanDate!: Date;
  public returnDate!: Date;
  public status!: 'active' | 'returned' | 'overdue';
  public observations!: string;
}

Loan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    equipmentId: { type: DataTypes.INTEGER, allowNull: false },
    loanDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    returnDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'returned', 'overdue'), defaultValue: 'active' },
    observations: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'loans', timestamps: true }
);

export default Loan;