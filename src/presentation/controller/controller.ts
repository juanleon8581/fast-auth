import { AuthRepository } from "@/domain/auth/repositories/auth.repository";
import { LoginUser } from "@/domain/auth/use-cases/login-user";
import { RegisterUser } from "@/domain/auth/use-cases/register-user";
import { LogoutAuth } from "@/domain/auth/use-cases/logout-user";
import { LoginValidator } from "@/infrastructure/validators/login.validator";
import { RegisterValidator } from "@/infrastructure/validators/register.validator";
import { LogoutValidator } from "@/infrastructure/validators/logout.validator";
import { ResponseHelper } from "@/presentation/utils/response-helper";

import { Request, Response, NextFunction } from "express";
import { UpdateUserValidator } from "@/infrastructure/validators/update-user.validator";
import { UpdateUser } from "@/domain/use-cases/update-user";
import { UpdateUserPassword } from "@/domain/use-cases/update-user-password";

import { RequestResetPasswordEmailValidator } from "@/infrastructure/validators/request-reset-password-email.validator";
import { CryptoService } from "@/infrastructure/services/crypto.service";
import { RequestResetPasswordEmail } from "@/domain/auth/use-cases/request-reset-password-email";

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

  public logout = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = LogoutValidator.validate(req.body);

      new LogoutAuth(this.datasource)
        .execute(dto)
        .then(() =>
          ResponseHelper.success(
            res,
            { message: "Logout successful" },
            req,
            200,
          ),
        )
        .catch(next);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const dto = UpdateUserValidator.validate(req.body);

      new UpdateUser(this.datasource)
        .execute(dto)
        .then((user) => ResponseHelper.success(res, user, req, 200))
        .catch(next);
    } catch (error) {
      next(error);
    }
  };

  public updateUserPassword = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const dto = UpdateUserValidator.validate(req.body);

      new UpdateUserPassword(this.datasource)
        .execute(dto)
        .then((user) => ResponseHelper.success(res, user, req, 200))
        .catch(next);
    } catch (error) {
      next(error);
    }
  };

  public requestResetPasswordEmail = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const dto = RequestResetPasswordEmailValidator.validate(req.body);

      new RequestResetPasswordEmail(this.datasource)
        .execute(dto)
        .then(() =>
          ResponseHelper.success(
            res,
            { message: "Reset password email sent successfully" },
            req,
            200,
          ),
        )
        .catch(next);
    } catch (error) {
      next(error);
    }
  };

  public getPublicKey = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const cryptoService = CryptoService.getInstance();
      const publicKeyDerBase64url = cryptoService.getLatestPublicKeyBase64url();
      ResponseHelper.success(res, { publicKeyDerBase64url }, req, 200);
    } catch (error) {
      next(error);
    }
  };
}
