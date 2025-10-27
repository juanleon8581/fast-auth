import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";

import { LoginDto } from "@/domain/auth/dtos/login.dto";

import type { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

import { STRONG_PASSWORD_PATTERN } from "@/domain/shared/validators/regex.validators";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

import { processValidationError } from "../../../helpers/validators/processError.validator";

const { VALIDATION } = ERROR_MESSAGES.AUTH.REGISTER;

const loginSchema = z.object({
  email: z.email(VALIDATION.EMAIL.INVALID_FORMAT),
  password: z
    .string()
    .min(8, VALIDATION.PASSWORD.MIN_LENGTH)
    .max(128, VALIDATION.PASSWORD.MAX_LENGTH)
    .regex(STRONG_PASSWORD_PATTERN, VALIDATION.PASSWORD.INVALID_FORMAT),
});

type ILoginSchema = z.infer<typeof loginSchema>;

export class LoginValidator {
  static validate(data: TRawJson): LoginDto {
    try {
      const validatedData: ILoginSchema = loginSchema.parse(data);

      const [error, loginDto] = LoginDto.createFrom(validatedData);

      if (error) {
        throw new BadRequestError(error);
      }

      return loginDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
