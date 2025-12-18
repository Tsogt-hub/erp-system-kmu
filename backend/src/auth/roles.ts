import { RoleDefinition } from './types';

export const roleCatalog: Record<string, RoleDefinition> = {
  admin: {
    name: 'admin',
    description: 'Voller Systemzugriff',
    permissions: [
      'feature-store:read',
      'feature-store:write',
      'feature-store:sync',
      'metadata:read',
      'metadata:write',
      'governance:manage',
      'users:manage',
      'audit:read',
      'pipelines:run',
      'all',
    ],
  },
  operations_lead: {
    name: 'operations_lead',
    description: 'Führt Planung und operative Freigaben durch',
    permissions: ['metadata:read', 'pipelines:run', 'audit:read', 'feature-store:read'],
  },
  project_manager: {
    name: 'project_manager',
    permissions: ['metadata:read'],
  },
  employee: {
    name: 'employee',
    permissions: [],
  },
};

export function getRolePermissions(roleName: string): string[] {
  const role = roleCatalog[roleName] ?? roleCatalog.employee;
  const inherited = role.inherits ?? [];
  const inheritedPermissions = inherited.flatMap((parent) => getRolePermissions(parent));
  return Array.from(new Set([...role.permissions, ...inheritedPermissions]));
}


