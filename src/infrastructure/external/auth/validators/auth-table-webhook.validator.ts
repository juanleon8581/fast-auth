import { ValidationError } from "@/domain/errors/validation-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";

import { processValidationError } from "@/infrastructure/helpers/validators/processError.validator";
import { z } from "zod";

const insertSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  email_verified: z.boolean(),
  phone: z.string(),
});

export class AuthTableWebhookValidator {
  static validate(data: TRawJson): SyncUserFromAuthDto {
    try {
      const { record } = data;

      if (!record) {
        throw new ValidationError(
          ERROR_MESSAGES.DATA_VALIDATION.INVALID_WEBHOOK_DATA,
        );
      }

      const validatedData = insertSchema.parse(record);

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
