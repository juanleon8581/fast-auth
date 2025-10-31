import { z } from "zod";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

import {
  EMAIL_BASIC_REGEX,
  PERSON_NAME_PATTERN,
  PHONE_INTERNATIONAL_REGEX,
  STRONG_PASSWORD_PATTERN,
} from "@/domain/shared/validators/regex.validators";
import { TUserRole } from "@/domain/shared/interfaces/general.interfaces";

const { VALIDATION: E_REGISTER_MSGS } = ERROR_MESSAGES.AUTH.REGISTER;
const { VALIDATION: E_UPDATE_MSGS } = ERROR_MESSAGES.AUTH.UPDATE_USER;

const UserRole: TUserRole[] = ["ADMIN", "USER", "MODERATOR"] as const;

export const userSchemas = {
  name: z
    .string()
    .min(2, E_REGISTER_MSGS.NAME.MIN_LENGTH)
    .max(50, E_REGISTER_MSGS.NAME.MAX_LENGTH)
    .regex(PERSON_NAME_PATTERN, E_REGISTER_MSGS.NAME.INVALID_FORMAT)
    .toLowerCase(),

  lastname: z
    .string()
    .min(2, E_REGISTER_MSGS.LASTNAME.MIN_LENGTH)
    .max(50, E_REGISTER_MSGS.LASTNAME.MAX_LENGTH)
    .regex(PERSON_NAME_PATTERN, E_REGISTER_MSGS.LASTNAME.INVALID_FORMAT)
    .toLowerCase(),

  display_name: z.string(),

  email_verified: z.boolean().optional(),

  email: z
    .email(E_REGISTER_MSGS.EMAIL.INVALID_FORMAT)
    .regex(EMAIL_BASIC_REGEX, E_REGISTER_MSGS.EMAIL.INVALID_FORMAT)
    .max(100, E_REGISTER_MSGS.EMAIL.MAX_LENGTH)
    .toLowerCase(),

  password: z
    .string()
    .min(8, E_REGISTER_MSGS.PASSWORD.MIN_LENGTH)
    .max(128, E_REGISTER_MSGS.PASSWORD.MAX_LENGTH)
    .regex(STRONG_PASSWORD_PATTERN, E_REGISTER_MSGS.PASSWORD.INVALID_FORMAT),

  phone: z
    .string()
    .min(10, E_REGISTER_MSGS.PHONE.MIN_LENGTH)
    .max(15, E_REGISTER_MSGS.PHONE.MAX_LENGTH)
    .regex(PHONE_INTERNATIONAL_REGEX, E_REGISTER_MSGS.PHONE.INVALID_FORMAT)
    .toLowerCase(),

  role: z.enum(UserRole, { message: E_REGISTER_MSGS.ROLE.INVALID_FORMAT }),

  metadata: z.record(z.string(), z.string()),
};

export const tokenSchemas = {
  sessionToken: z
    .string({
      message: E_UPDATE_MSGS.SESSION_TOKEN.REQUIRED,
    })
    .min(1, E_UPDATE_MSGS.SESSION_TOKEN.REQUIRED),

  refreshToken: z
    .string({
      message: E_UPDATE_MSGS.REFRESH_TOKEN.REQUIRED,
    })
    .min(1, E_UPDATE_MSGS.REFRESH_TOKEN.REQUIRED),
};
