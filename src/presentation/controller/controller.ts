import { RegisterDto } from "@/domain/dtos/register.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";
import { RegisterUser } from "@/domain/use-cases/register-user";
import { RegisterValidator } from "@/infrastructure/validators/register.validator";

import { Request, Response, NextFunction } from "express";

export class AuthController {
  constructor(private readonly datasource: AuthRepository) {}
  public register = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = RegisterValidator.validate(req.body);

      new RegisterUser(this.datasource)
        .execute(dto)
        .then((user) => res.json(user))
        .catch(next);
    } catch (error) {
      next(error);
    }
  };
}
