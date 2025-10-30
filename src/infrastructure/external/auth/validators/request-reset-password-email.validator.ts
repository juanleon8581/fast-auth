import { z } from "zod";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { URL_REGEX } from "@/domain/shared/validators/regex.validators";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { processValidationError } from "../../../helpers/validators/processError.validator";
import { userSchemas } from "./schemas/auth.schemas";

const { VALIDATION } = ERROR_MESSAGES.AUTH.REQUEST_RESET_PASSWORD_EMAIL;

const requestResetPasswordEmailSchema = z.object({
  email: userSchemas.email,

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
