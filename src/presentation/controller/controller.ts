import { AuthRepository } from "@/domain/repositories/auth.repository";
import { LoginUser } from "@/domain/use-cases/login-user";
import { RegisterUser } from "@/domain/use-cases/register-user";
import { LoginValidator } from "@/infrastructure/validators/login.validator";
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
        .catch(next); // Delegate Error to centralized error middleware
    } catch (error) {
      next(error); // Delegate Error to centralized error middleware
    }
  };

  public login = (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = LoginValidator.validate(req.body);

      new LoginUser(this.datasource)
        .execute(dto)
        .then((user) => ResponseHelper.success(res, user, req, 200))
        .catch(next);
    } catch (error) {
      next(error);
    }
  };
}
