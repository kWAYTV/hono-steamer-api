// Base API Response Types
export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  message: string;
}

export interface ApiSuccessResponse<T> extends ApiResponse {
  success: true;
  message: string;
  data: T;
}

// Service Response Types
export interface ServiceError {
  success: false;
  error: string;
}

export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;
