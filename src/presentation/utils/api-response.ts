export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccessResponse<T = any> {
  status: 'success';
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  status: 'error';
  code: number;
  errors: {
    message: string;
    field?: string;
    code?: string;
  }[];
  meta: ApiResponseMeta;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiResponseBuilder {
  /**
   * Crea una respuesta exitosa estándar
   */
  static success<T>(
    data: T,
    meta: Partial<ApiResponseMeta> = {}
  ): ApiSuccessResponse<T> {
    return {
      status: 'success',
      data,
      meta: {
        requestId: meta.requestId || '',
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || '1.0.0',
        ...(meta.pagination && { pagination: meta.pagination })
      }
    };
  }

  /**
   * Crea una respuesta de error estándar
   */
  static error(
    code: number,
    errors: {
      message: string;
      field?: string;
      code?: string;
    }[],
    meta: Partial<ApiResponseMeta> = {}
  ): ApiErrorResponse {
    return {
      status: 'error',
      code,
      errors,
      meta: {
        requestId: meta.requestId || '',
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || '1.0.0'
      }
    };
  }

  /**
   * Crea una respuesta paginada
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    meta: Partial<ApiResponseMeta> = {}
  ): ApiSuccessResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    return {
      status: 'success',
      data,
      meta: {
        requestId: meta.requestId || '',
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || '1.0.0',
        pagination: {
          ...pagination,
          totalPages
        }
      }
    };
  }
}