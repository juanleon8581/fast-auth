import { AuthRepository } from "@/domain/repositories/auth.repository";
import { RegisterUser } from "@/domain/use-cases/register-user";
import { RegisterValidator } from "@/infrastructure/validators/register.validator";
import { ResponseHelper } from "@/presentation/utils/response-helper";

import { Request, Response, NextFunction } from "express";

export class AuthController {
  constructor(private readonly datasource: AuthRepository) {}
  public register = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = RegisterValidator.validate(req.body);

      new RegisterUser(this.datasource)
        .execute(dto)
        .then((user) => ResponseHelper.success(res, user, req, 201))
        .catch(next); // Delegar errores al middleware centralizado
    } catch (error) {
      next(error); // Delegar errores de validación al middleware centralizado
    }
  };
}
