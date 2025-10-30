import { ValidationError } from "@/domain/errors/validation-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";

import { processValidationError } from "@/infrastructure/helpers/validators/processError.validator";
import { z } from "zod";
import { userSchemas } from "./schemas/auth.schemas";

const insertSchema = z.object({
  id: z.uuid(),
  email: userSchemas.email,
  name: userSchemas.name,
  lastname: userSchemas.lastname,
  role: userSchemas.role,
  email_verified: userSchemas.email_verified,
  phone: userSchemas.phone.optional(),
  display_name: userSchemas.display_name,
});

export class AuthTableWebhookValidator {
  static validate(data: TRawJson): SyncUserFromAuthDto {
    try {
      const { record } = data;

      if (
        !record ||
        !record.id ||
        !record.email ||
        !record.raw_user_meta_data ||
        !record.id
      ) {
        throw new ValidationError(
          ERROR_MESSAGES.DATA_VALIDATION.INVALID_WEBHOOK_DATA,
        );
      }

      const { id, email, phone, raw_user_meta_data: rawUserMetadata } = record;

      const { name, lastname, role, email_verified, display_name } =
        rawUserMetadata;

      if (!name || !lastname || !role || !email_verified || !display_name) {
        throw new ValidationError(
          ERROR_MESSAGES.DATA_VALIDATION.INVALID_WEBHOOK_DATA,
        );
      }

      const objForValidation = {
        id,
        email,
        phone: phone ?? undefined,
        name,
        lastname,
        role,
        email_verified,
        display_name,
      };

      const validatedData = insertSchema.parse(objForValidation);

      const [error, syncUserFromAuthDto] =
        SyncUserFromAuthDto.createFrom(validatedData);

      if (error) {
        throw new ValidationError(error);
      }

      return syncUserFromAuthDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
