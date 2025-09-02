import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";

import { LoginDto } from "@/domain/dtos/login.dto";

import type { TRawJson } from "@/domain/interfaces/general.interfaces";

import { SECURE_PASSWORD_REGEX } from "@/config/regex/validations.regex";
import globalStrings from "@/config/strings/global.strings.json";
import { processValidationError } from "./utils.validator";

const { VALIDATION } = globalStrings.ERRORS.AUTH.REGISTER;

const loginSchema = z.object({
  email: z.email(VALIDATION.EMAIL.INVALID_FORMAT),
  password: z
    .string()
    .min(8, VALIDATION.PASSWORD.MIN_LENGTH)
    .max(128, VALIDATION.PASSWORD.MAX_LENGTH)
    .regex(SECURE_PASSWORD_REGEX, VALIDATION.PASSWORD.INVALID_FORMAT),
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
