import { Request, Response, NextFunction } from "express";

import { UserRepository } from "@/domain/user/repositories/user.repository";
import { AuthTableWebhookValidator } from "@/infrastructure/external/auth/validators/auth-table-webhook.validator";
import { SyncUserFromAuth } from "@/domain/user/use-cases/sync-user-from-auth";
import { ResponseHelper } from "../../utils/response-helper";

export class UserWebhookController {
  constructor(private readonly datasource: UserRepository) {}

  public handleAuthUserCreated = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      const dto = AuthTableWebhookValidator.validate(req.body);

      new SyncUserFromAuth(this.datasource)
        .execute(dto)
        .then(() =>
          ResponseHelper.success(
            res,
            { message: "User synced successfully" },
            req,
            200,
          ),
        )
        .catch(next);
    } catch (error) {
      next(error);
    }
  };
}
