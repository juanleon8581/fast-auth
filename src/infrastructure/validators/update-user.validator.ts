import { z } from "zod";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import globalStrings from "@/config/strings/global.strings.json";
import {
  SECURE_PASSWORD_REGEX,
  EMAIL_BASIC_REGEX,
  PHONE_INTERNATIONAL_REGEX,
  NAME_LASTNAME_REGEX,
} from "@/config/regex/validations.regex";
import { processValidationError } from "./utils/processError.validator";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { TRawJson } from "@/domain/interfaces/general.interfaces";

const { VALIDATION } = globalStrings.ERRORS.AUTH.UPDATE_USER;
const { VALIDATION: VALIDATION_GENERAL } = globalStrings.ERRORS.AUTH.REGISTER;

const updateUserSchema = z
  .object({
    sessionToken: z
      .string({
        message: VALIDATION.SESSION_TOKEN.REQUIRED,
      })
      .min(1, VALIDATION.SESSION_TOKEN.REQUIRED),

    refreshToken: z
      .string({
        message: VALIDATION.REFRESH_TOKEN.REQUIRED,
      })
      .min(1, VALIDATION.REFRESH_TOKEN.REQUIRED),

    email: z
      .email(VALIDATION.EMAIL.INVALID_FORMAT)
      .regex(EMAIL_BASIC_REGEX, VALIDATION.EMAIL.INVALID_FORMAT)
      .max(100, VALIDATION_GENERAL.EMAIL.MAX_LENGTH)
      .optional()
      .or(z.literal("")),

    newPassword: z
      .string()
      .min(8, VALIDATION.NEW_PASSWORD.MIN_LENGTH)
      .max(128, VALIDATION.NEW_PASSWORD.MAX_LENGTH)
      .regex(SECURE_PASSWORD_REGEX, VALIDATION.NEW_PASSWORD.INVALID_FORMAT)
      .optional()
      .or(z.literal("")),

    newPasswordConfirmation: z.string().optional().or(z.literal("")),

    phone: z
      .string()
      .regex(PHONE_INTERNATIONAL_REGEX, VALIDATION.PHONE.INVALID_FORMAT)
      .optional()
      .or(z.literal("")),

    name: z
      .string()
      .min(2, VALIDATION_GENERAL.NAME.MIN_LENGTH)
      .max(50, VALIDATION_GENERAL.NAME.MAX_LENGTH)
      .regex(NAME_LASTNAME_REGEX, VALIDATION_GENERAL.NAME.INVALID_FORMAT)
      .optional(),

    lastname: z
      .string()
      .min(2, VALIDATION_GENERAL.LASTNAME.MIN_LENGTH)
      .max(50, VALIDATION_GENERAL.LASTNAME.MAX_LENGTH)
      .regex(NAME_LASTNAME_REGEX, VALIDATION_GENERAL.LASTNAME.INVALID_FORMAT)
      .optional(),
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
