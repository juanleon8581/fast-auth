import { z } from "zod";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";

import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { processValidationError } from "../../../helpers/validators/processError.validator";
import { userSchemas } from "@/infrastructure/external/auth/validators/schemas/auth.schemas";
import { UserRole } from "@/infrastructure/persistence/database.client";

const registerSchema = z.object({
  name: userSchemas.name,
  lastname: userSchemas.lastname,
  email: userSchemas.email,
  password: userSchemas.password,
  phone: userSchemas.phone.optional(),
  role: userSchemas.role.optional().default(UserRole.USER),
  metadata: userSchemas.metadata.optional().default({}),
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
