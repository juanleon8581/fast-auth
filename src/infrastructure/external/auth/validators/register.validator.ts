import { z } from "zod";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

import {
  EMAIL_BASIC_REGEX,
  PERSON_NAME_PATTERN,
  STRONG_PASSWORD_PATTERN,
} from "@/domain/shared/validators/regex.validators";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { processValidationError } from "../../../helpers/validators/processError.validator";

const { VALIDATION } = ERROR_MESSAGES.AUTH.REGISTER;

const registerSchema = z.object({
  name: z
    .string()
    .min(2, VALIDATION.NAME.MIN_LENGTH)
    .max(50, VALIDATION.NAME.MAX_LENGTH)
    .regex(PERSON_NAME_PATTERN, VALIDATION.NAME.INVALID_FORMAT),

  lastname: z
    .string()
    .min(2, VALIDATION.LASTNAME.MIN_LENGTH)
    .max(50, VALIDATION.LASTNAME.MAX_LENGTH)
    .regex(PERSON_NAME_PATTERN, VALIDATION.LASTNAME.INVALID_FORMAT),

  email: z
    .email(VALIDATION.EMAIL.INVALID_FORMAT)
    .regex(EMAIL_BASIC_REGEX, VALIDATION.EMAIL.INVALID_FORMAT)
    .max(100, VALIDATION.EMAIL.MAX_LENGTH)
    .toLowerCase(),

  password: z
    .string()
    .min(8, VALIDATION.PASSWORD.MIN_LENGTH)
    .max(128, VALIDATION.PASSWORD.MAX_LENGTH)
    .regex(STRONG_PASSWORD_PATTERN, VALIDATION.PASSWORD.INVALID_FORMAT),
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
