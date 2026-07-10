import apiClient from './client';

export interface Organization {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrganizationListResponse {
  data: Organization[];
  pagination: OrganizationPagination;
}

export const organizationsApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrganizationListResponse> => {
    const { data } = await apiClient.get('/organizations', { params });
    return data;
  },

  getById: async (id: string): Promise<Organization> => {
    const { data } = await apiClient.get(`/organizations/${id}`);
    return data;
  },

  create: async (payload: {
    name: string;
    email: string;
    status?: string;
  }): Promise<Organization> => {
    const { data } = await apiClient.post('/organizations', payload);
    return data;
  },

  update: async (
    id: string,
    payload: { name?: string; email?: string; status?: string },
  ): Promise<Organization> => {
    const { data } = await apiClient.patch(`/organizations/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`);
  },
};
