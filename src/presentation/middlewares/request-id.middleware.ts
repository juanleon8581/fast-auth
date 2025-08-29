import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extender la interfaz Request para incluir requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export class RequestIdMiddleware {
  /**
   * Middleware que genera un ID único para cada request
   * y lo agrega al objeto request para uso posterior
   */
  static generate(req: Request, res: Response, next: NextFunction): void {
    // Generar un ID único para este request
    req.requestId = uuidv4();
    
    // Agregar el requestId a los headers de respuesta para debugging
    res.setHeader('X-Request-ID', req.requestId);
    
    next();
  }
}