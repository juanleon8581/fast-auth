export interface IApiResponseMeta {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IApiSuccessResponse<T = any> {
  status: "success";
  data: T;
  meta: IApiResponseMeta;
}

export interface IApiErrorResponse {
  status: "error";
  code: number;
  errors: {
    message: string;
    field?: string;
    code?: string;
  }[];
  meta: IApiResponseMeta;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;

export class ApiResponseBuilder {
  /**
   * Crea una respuesta exitosa estándar
   */
  static success<T>(
    data: T,
    meta: Partial<IApiResponseMeta> = {},
  ): IApiSuccessResponse<T> {
    return {
      status: "success",
      data,
      meta: {
        requestId: meta.requestId || "",
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || "1.0.0",
        ...(meta.pagination && { pagination: meta.pagination }),
      },
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
    meta: Partial<IApiResponseMeta> = {},
  ): IApiErrorResponse {
    return {
      status: "error",
      code,
      errors,
      meta: {
        requestId: meta.requestId || "",
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || "1.0.0",
      },
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
    meta: Partial<IApiResponseMeta> = {},
  ): IApiSuccessResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return {
      status: "success",
      data,
      meta: {
        requestId: meta.requestId || "",
        timestamp: meta.timestamp || new Date().toISOString(),
        version: meta.version || "1.0.0",
        pagination: {
          ...pagination,
          totalPages,
        },
      },
    };
  }
}
