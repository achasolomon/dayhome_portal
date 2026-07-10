import apiClient from './client';

export interface PermissionDef {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  group: string;
  groupLabel: string;
  permissions: PermissionDef[];
}

export interface RoleWithPermissions {
  role: string;
  label: string;
  permissions: string[];
}

export interface RolesApiResponse {
  roles: RoleWithPermissions[];
  permissionGroups: PermissionGroup[];
}

export const rolesApi = {
  async getPermissions(): Promise<RolesApiResponse> {
    const response = await apiClient.get('/roles/permissions');
    return response.data;
  },

  async updateRolePermissions(role: string, permissions: string[]): Promise<RoleWithPermissions> {
    const response = await apiClient.patch(`/roles/permissions/${role}`, { permissions });
    return response.data;
  },

  async createRole(role: string, label: string): Promise<RoleWithPermissions> {
    const response = await apiClient.post('/roles', { role, label });
    return response.data;
  },

  async deleteRole(role: string): Promise<void> {
    await apiClient.delete(`/roles/${role}`);
  },
};
