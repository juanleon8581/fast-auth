import { Request, Response } from 'express';
import { ApiResponseBuilder, ApiSuccessResponse } from './api-response';

export class ResponseHelper {
  /**
   * Envía una respuesta exitosa usando el formato estándar de API
   */
  static success<T>(
    res: Response,
    data: T,
    req?: Request,
    statusCode: number = 200
  ): void {
    const response: ApiSuccessResponse<T> = ApiResponseBuilder.success(data, {
      requestId: req?.requestId || '',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

    res.status(statusCode).json(response);
  }

  /**
   * Envía una respuesta paginada usando el formato estándar de API
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    req?: Request,
    statusCode: number = 200
  ): void {
    const response = ApiResponseBuilder.paginated(data, pagination, {
      requestId: req?.requestId || '',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

    res.status(statusCode).json(response);
  }
}