export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    requestId?: string;
    timestamp?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }>;
    requestId?: string;
  };
  meta: {
    requestId?: string;
    timestamp: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

export interface RefreshResponse {
  accessToken: string;
  user: Record<string, unknown>;
}
