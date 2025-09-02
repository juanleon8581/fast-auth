import { z } from "zod";
import { RegisterDto } from "@/domain/dtos/register.dto";
import globalStrings from "@/config/strings/global.strings.json";
import {
  NAME_LASTNAME_REGEX,
  SECURE_PASSWORD_REGEX,
} from "@/config/regex/validations.regex";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/interfaces/general.interfaces";
import { processValidationError } from "./utils/processError.validator";

const { VALIDATION } = globalStrings.ERRORS.AUTH.REGISTER;

const registerSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION.NAME.MIN_LENGTH)
    .max(50, VALIDATION.NAME.MAX_LENGTH)
    .regex(NAME_LASTNAME_REGEX, VALIDATION.NAME.INVALID_FORMAT),

  lastname: z
    .string()
    .min(2, VALIDATION.LASTNAME.MIN_LENGTH)
    .max(50, VALIDATION.LASTNAME.MAX_LENGTH)
    .regex(NAME_LASTNAME_REGEX, VALIDATION.LASTNAME.INVALID_FORMAT),

  email: z
    .email(VALIDATION.EMAIL.INVALID_FORMAT)
    .max(100, VALIDATION.EMAIL.MAX_LENGTH)
    .toLowerCase(),

  password: z
    .string()
    .min(8, VALIDATION.PASSWORD.MIN_LENGTH)
    .max(128, VALIDATION.PASSWORD.MAX_LENGTH)
    .regex(SECURE_PASSWORD_REGEX, VALIDATION.PASSWORD.INVALID_FORMAT),
});

export class RegisterValidator {
  static validate(data: TRawJson): RegisterDto {
    try {
      const validatedData = registerSchema.parse(data);

      const [dtoError, registerDto] = RegisterDto.createFrom(validatedData);

      if (dtoError) {
        throw new BadRequestError(dtoError);
      }

      return registerDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
