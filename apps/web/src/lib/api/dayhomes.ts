import apiClient from './client';

export interface DayhomeListItem {
  id: string;
  name: string;
  status: string;
  educatorFirstName: string;
  educatorLastName: string;
  educatorEmail: string;
  addressCity: string;
  addressProvince: string;
  currentCapacity: number;
  maximumCapacity: number;
  nextComplianceDue?: string;
  inspectionResult?: string;
  createdAt: string;
}

export interface DayhomeDetail {
  id: string;
  organizationId: string;
  ownerId: string;
  externalId: string;
  name: string;
  status: string;
  portalStatus: string;
  educatorFirstName: string;
  educatorLastName: string;
  educatorEmail: string;
  educatorPhone: string;
  addressLine1: string;
  addressCity: string;
  addressProvince: string;
  addressPostalCode: string;
  addressFull: string;
  homeType: string;
  homeOwnership: string;
  fencedBackyard: boolean;
  smokingStatus: string;
  hasPets: boolean;
  homeResidentsCount: number;
  eveningOvernightCare: boolean;
  currentCapacity: number;
  maximumCapacity: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  childcareLevel?: string;
  languagesSpoken?: string;
  childcareEducation?: string;
  specializations?: string[];
  certificateNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseStatus: string;
  submittedAt: string;
  approvedAt: string;
  activatedAt: string;
  nextComplianceDue?: string;
  inspectionConductedAt?: string;
  inspectionResult?: string;
  inspectionScore?: number;
  inspectionItemsPassed?: number;
  inspectionItemsFailed?: number;
  inspectionCriticalFailures?: number;
  inspectionSummary?: string;
  inspectionInspectorName?: string;
  profileItems?: object[];
  createdAt: string;
  updatedAt: string;
}

export interface DayhomePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DayhomeListResponse {
  success: boolean;
  data: DayhomeListItem[];
  pagination: DayhomePagination;
}

export const dayhomesApi = {
  async list(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<DayhomeListResponse> {
    const response = await apiClient.get('/dayhomes', { params });
    return response.data;
  },

  async getById(id: string): Promise<DayhomeDetail> {
    const response = await apiClient.get(`/dayhomes/${id}`);
    return response.data;
  },
};
