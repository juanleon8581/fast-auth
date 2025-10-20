import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";

import { LogoutDto } from "@/domain/auth/dtos/logout.dto";

import type { TRawJson } from "@/domain/interfaces/general.interfaces";

import globalStrings from "@/config/strings/global.strings.json";
import { processValidationError } from "./utils/processError.validator";

const { VALIDATION } = globalStrings.ERRORS.AUTH.LOGOUT;

const logoutSchema = z.object({
  sessionToken: z
    .string({ message: VALIDATION.ACCESS_TOKEN.REQUIRED })
    .min(1, VALIDATION.ACCESS_TOKEN.REQUIRED),
  refreshToken: z
    .string({ message: VALIDATION.REFRESH_TOKEN.REQUIRED })
    .min(1, VALIDATION.REFRESH_TOKEN.REQUIRED),
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
