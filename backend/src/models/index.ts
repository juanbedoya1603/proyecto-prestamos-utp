import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import RefreshToken from './RefreshToken';
import Category from './Category';
import Equipment from './Equipment';
import Loan from './Loan';

// ── Relaciones del Profesor (Auth & RBAC) ─────────────────────
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// ── Relaciones de Préstamos (Dominio del Proyecto) ────────────

// 1. Categoría 1 : N Equipos
Category.hasMany(Equipment, { foreignKey: 'categoryId', as: 'equipments' });
Equipment.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 2. Usuario 1 : N Préstamos
User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });
Loan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. Equipo 1 : N Préstamos
Equipment.hasMany(Loan, { foreignKey: 'equipmentId', as: 'loans' });
Loan.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

export { User, Role, Permission, RolePermission, RefreshToken, Category, Equipment, Loan };