import { z } from "zod";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import globalStrings from "@/config/strings/global.strings.json";
import { EMAIL_BASIC_REGEX, URL_REGEX } from "@/config/regex/validations.regex";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { processValidationError } from "./utils/processError.validator";

const { VALIDATION } = globalStrings.ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL;

const requestResetPasswordEmailSchema = z.object({
  email: z
    .email(VALIDATION.EMAIL.INVALID_FORMAT)
    .regex(EMAIL_BASIC_REGEX, VALIDATION.EMAIL.INVALID_FORMAT)
    .max(100, VALIDATION.EMAIL.MAX_LENGTH)
    .toLowerCase(),

  redirectTo: z
    .string()
    .regex(URL_REGEX, VALIDATION.REDIRECT_TO.INVALID_FORMAT)
    .max(500, VALIDATION.REDIRECT_TO.MAX_LENGTH)
    .optional(),
});

export class RequestResetPasswordEmailValidator {
  static validate(data: TRawJson): RequestResetPasswordEmailDto {
    try {
      const validatedData = requestResetPasswordEmailSchema.parse(data);

      const [dtoError, requestResetPasswordEmailDto] =
        RequestResetPasswordEmailDto.createFrom(validatedData);

      if (dtoError) {
        throw new BadRequestError(dtoError);
      }

      return requestResetPasswordEmailDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
