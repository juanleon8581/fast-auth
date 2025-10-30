import { z } from "zod";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

import { processValidationError } from "@/infrastructure/helpers/validators/processError.validator";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { tokenSchemas, userSchemas } from "./schemas/auth.schemas";

const { VALIDATION } = ERROR_MESSAGES.AUTH.UPDATE_USER;

const updateUserSchema = z
  .object({
    sessionToken: tokenSchemas.sessionToken,
    refreshToken: tokenSchemas.refreshToken,
    email: userSchemas.email.optional().or(z.literal("")),
    name: userSchemas.name.optional().or(z.literal("")),
    lastname: userSchemas.lastname.optional().or(z.literal("")),
    display_name: z.string().optional().or(z.literal("")),
    role: userSchemas.role.optional().or(z.literal("")),
    metadata: userSchemas.metadata.optional(),
    phone: userSchemas.phone.optional().or(z.literal("")),
    newPassword: userSchemas.password.optional().or(z.literal("")),
    newPasswordConfirmation: userSchemas.password.optional().or(z.literal("")),
  })

  .refine(
    (data) => {
      // If name or lastname is provided, both must be provided
      if ((data.name || data.lastname) && (!data.name || !data.lastname)) {
        return false;
      }
      return true;
    },
    {
      message: VALIDATION.NAME_LASTNAME.BOTH_REQUIRED,
      path: ["name"],
    },
  )
  .refine(
    (data) => {
      // If newPassword is provided, newPasswordConfirmation is required
      if (data.newPassword && data.newPassword !== "") {
        return (
          data.newPasswordConfirmation && data.newPasswordConfirmation !== ""
        );
      }
      return true;
    },
    {
      message: VALIDATION.NEW_PASSWORD_CONFIRMATION.REQUIRED_WITH_PASSWORD,
      path: ["newPasswordConfirmation"],
    },
  )
  .refine(
    (data) => {
      // If both passwords are provided, they must match
      if (
        data.newPassword &&
        data.newPassword !== "" &&
        data.newPasswordConfirmation &&
        data.newPasswordConfirmation !== ""
      ) {
        return data.newPassword === data.newPasswordConfirmation;
      }

      return true;
    },
    {
      message: VALIDATION.NEW_PASSWORD_CONFIRMATION.MUST_MATCH,
      path: ["newPasswordConfirmation"],
    },
  );

export class UpdateUserValidator {
  static validate(data: TRawJson): UpdateUserDto {
    try {
      const validatedData = updateUserSchema.parse(data);

      const [dtoError, dto] = UpdateUserDto.createFrom(validatedData);

      if (dtoError) {
        throw new BadRequestError(dtoError);
      }

      return dto!;
    } catch (error) {
      processValidationError(error);
      throw error;
    }
  }
}
