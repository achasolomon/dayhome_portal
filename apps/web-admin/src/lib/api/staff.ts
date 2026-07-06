import apiClient from './client';

export interface StaffMember {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  status: string;
  createdAt: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface StaffPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StaffListResponse {
  staff: StaffMember[];
  pagination: StaffPagination;
  pendingInvitations: StaffInvitation[];
}

export interface InviteStaffPayload {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface CheckInvitationResult {
  valid: boolean;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  message?: string;
}

export interface AcceptInvitePayload {
  token: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
}

export const staffApi = {
  async invite(data: InviteStaffPayload): Promise<StaffInvitation> {
    const response = await apiClient.post('/staff/invite', data);
    return response.data;
  },

  async list(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<StaffListResponse> {
    const response = await apiClient.get('/staff', { params });
    return response.data;
  },

  async checkInvitation(token: string): Promise<CheckInvitationResult> {
    const response = await apiClient.get(`/staff/invitation/${token}`);
    return response.data;
  },

  async acceptInvite(data: AcceptInvitePayload): Promise<{ message: string }> {
    const response = await apiClient.post('/staff/accept-invite', data);
    return response.data;
  },
};
