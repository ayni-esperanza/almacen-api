export enum Permission {
  // Inventory permissions
  INVENTORY_READ = 'inventory:read',
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',

  // Movements permissions
  MOVEMENTS_READ = 'movements:read',
  MOVEMENTS_CREATE = 'movements:create',
  MOVEMENTS_UPDATE = 'movements:update',
  MOVEMENTS_DELETE = 'movements:delete',

  // Equipment permissions
  EQUIPMENT_READ = 'equipment:read',
  EQUIPMENT_CREATE = 'equipment:create',
  EQUIPMENT_UPDATE = 'equipment:update',
  EQUIPMENT_DELETE = 'equipment:delete',

  // Reports permissions
  REPORTS_READ = 'reports:read',
  REPORTS_GENERATE = 'reports:generate',

  // User management permissions
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Provider permissions
  PROVIDERS_READ = 'providers:read',
  PROVIDERS_CREATE = 'providers:create',
  PROVIDERS_UPDATE = 'providers:update',
  PROVIDERS_DELETE = 'providers:delete',
}

import { UserRole } from '@prisma/client';

export { UserRole };

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // GERENTE: Puede ver todas las secciones (acceso completo)
  [UserRole.GERENTE]: [
    // Full access to everything
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.REPORTS_GENERATE,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.PROVIDERS_READ,
    Permission.PROVIDERS_CREATE,
    Permission.PROVIDERS_UPDATE,
    Permission.PROVIDERS_DELETE,
  ],

  // AYUDANTE: Stock, Movimientos, Equipo, Reportes y Proveedores (NO Usuarios)
  [UserRole.AYUDANTE]: [
    // Full access to allowed sections
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.REPORTS_GENERATE,
    Permission.PROVIDERS_READ,
    Permission.PROVIDERS_CREATE,
    Permission.PROVIDERS_UPDATE,
    Permission.PROVIDERS_DELETE,
    // No USERS permissions
  ],

  // ASISTENTE: Stock, Movimientos, Equipo y Reportes (NO Usuarios, NO Proveedores)
  [UserRole.ASISTENTE]: [
    // Full access to allowed sections only
    Permission.INVENTORY_READ,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.MOVEMENTS_READ,
    Permission.MOVEMENTS_CREATE,
    Permission.MOVEMENTS_UPDATE,
    Permission.MOVEMENTS_DELETE,
    Permission.EQUIPMENT_READ,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.REPORTS_READ,
    Permission.REPORTS_GENERATE,
    // No USERS permissions
    // No PROVIDERS permissions
  ],
};
