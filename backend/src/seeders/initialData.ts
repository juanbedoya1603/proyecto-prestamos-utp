// src/seeders/initialData.ts
import bcrypt from 'bcryptjs';
import { Role, Permission, RolePermission, User, Category, Equipment } from '../models';

const ROLES = [
  { name: 'superuser', description: 'Super administrador del sistema' },
  { name: 'admin',     description: 'Administrador de inventario' },
  { name: 'user',      description: 'Estudiante o profesor' },
];

const PERMISSIONS = [
  // Permisos base
  { name: 'users:create',  description: 'Crear usuarios' },
  { name: 'users:read',    description: 'Ver usuarios' },
  { name: 'users:update',  description: 'Actualizar usuarios' },
  { name: 'users:delete',  description: 'Eliminar usuarios' },
  { name: 'admins:create', description: 'Crear administradores' },
  // Nuevos permisos para Préstamos
  { name: 'equipments:read', description: 'Ver inventario de equipos' },
  { name: 'equipments:create', description: 'Crear nuevos equipos' },
  { name: 'equipments:update', description: 'Actualizar equipos' },
  { name: 'equipments:delete', description: 'Eliminar equipos' },
  { name: 'loans:create', description: 'Solicitar un préstamo' },
  { name: 'loans:read', description: 'Ver historial de préstamos' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superuser: ['users:create', 'users:read', 'users:update', 'users:delete', 'admins:create', 'equipments:read', 'equipments:create', 'equipments:update', 'equipments:delete', 'loans:read', 'loans:create'],
  admin:     ['users:read', 'equipments:read', 'equipments:create', 'equipments:update', 'equipments:delete', 'loans:read'],
  user:      ['equipments:read', 'loans:create', 'loans:read'],
};

export const runSeed = async (): Promise<void> => {
  // 1. Crear Roles y Permisos
  const roleMap: Record<string, Role> = {};
  for (const r of ROLES) {
    const [role] = await Role.findOrCreate({ where: { name: r.name }, defaults: r });
    roleMap[r.name] = role;
  }

  const permissionMap: Record<string, Permission> = {};
  for (const p of PERMISSIONS) {
    const [permission] = await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
    permissionMap[p.name] = permission;
  }

  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap[roleName];
    for (const permName of permNames) {
      const permission = permissionMap[permName];
      await RolePermission.findOrCreate({
        where: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // 2. Crear Superusuario
  const superEmail = process.env.SUPERUSER_EMAIL || 'super@admin.com';
  const existing = await User.findOne({ where: { email: superEmail } });
  
  if (!existing) {
    const superPassword = process.env.SUPERUSER_PASSWORD || 'Super@1234';
    const hashed = await bcrypt.hash(superPassword, 10);
    await User.create({
      name: 'Super Admin UTP',
      email: superEmail,
      password: hashed,
      roleId: roleMap['superuser'].id,
    });
    console.log(`Superusuario creado: ${superEmail}`);
  }

// 3. Crear Categorías de Prueba
  const catElectronica = await Category.findOrCreate({ 
    where: { name: 'Electrónica' }, 
    defaults: { name: 'Electrónica', description: 'Componentes electrónicos' }
  });
  const catAudiovisual = await Category.findOrCreate({ 
    where: { name: 'Audiovisuales' }, 
    defaults: { name: 'Audiovisuales', description: 'Proyectores y cámaras' }
  });

  // 4. Crear Equipos de Prueba
  await Equipment.findOrCreate({ 
    where: { serialNumber: 'SN-001' }, 
    defaults: { 
      serialNumber: 'SN-001', 
      name: 'Osciloscopio Tektronix', 
      status: 'available', 
      categoryId: catElectronica[0].id 
    }
  });
  await Equipment.findOrCreate({ 
    where: { serialNumber: 'SN-002' }, 
    defaults: { 
      serialNumber: 'SN-002', 
      name: 'Proyector Epson', 
      status: 'available', 
      categoryId: catAudiovisual[0].id 
    }
  });

  console.log('Seed completado: roles, permisos, superusuario, categorías y equipos listos');
};