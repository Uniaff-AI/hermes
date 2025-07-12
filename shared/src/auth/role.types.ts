export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN'
}

export interface RolePermissions {
  [UserRole.SUPERADMIN]: string[];
  [UserRole.ADMIN]: string[];
} 