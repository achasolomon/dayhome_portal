export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  PARENT = 'parent',
}
