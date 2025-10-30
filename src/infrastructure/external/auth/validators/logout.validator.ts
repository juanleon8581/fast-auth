import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";

import { LogoutDto } from "@/domain/auth/dtos/logout.dto";

import type { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

import { processValidationError } from "../../../helpers/validators/processError.validator";
import { tokenSchemas } from "./schemas/auth.schemas";

const logoutSchema = z.object({
  sessionToken: tokenSchemas.sessionToken,
  refreshToken: tokenSchemas.refreshToken,
});

type ILogoutSchema = z.infer<typeof logoutSchema>;

export class LogoutValidator {
  static validate(data: TRawJson): LogoutDto {
    try {
      const validatedData: ILogoutSchema = logoutSchema.parse(data);

      const [error, logoutDto] = LogoutDto.createFrom(validatedData);

      if (error) {
        throw new BadRequestError(error);
      }

      return logoutDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
