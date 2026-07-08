import { PermissionGroup } from '../permissions';

export interface RoleWithPermissions {
  role: string;
  label: string;
  permissions: string[];
}

export interface RolesApiResponse {
  roles: RoleWithPermissions[];
  permissionGroups: PermissionGroup[];
}
