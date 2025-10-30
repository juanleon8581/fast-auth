import { z } from "zod";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

import {
  EMAIL_BASIC_REGEX,
  PERSON_NAME_PATTERN,
  PHONE_INTERNATIONAL_REGEX,
  STRONG_PASSWORD_PATTERN,
} from "@/domain/shared/validators/regex.validators";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { processValidationError } from "../../../helpers/validators/processError.validator";
import { UserRole } from "@prisma/client";

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

  phone: z
    .string()
    .min(10, VALIDATION.PHONE.MIN_LENGTH)
    .max(15, VALIDATION.PHONE.MAX_LENGTH)
    .regex(PHONE_INTERNATIONAL_REGEX, VALIDATION.PHONE.INVALID_FORMAT)
    .optional(),
  role: z
    .enum(UserRole, { message: VALIDATION.ROLE.INVALID_FORMAT })
    .optional()
    .default(UserRole.USER),

  metadata: z.record(z.string(), z.string()).optional().default({}),
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
