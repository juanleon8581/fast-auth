import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";

import { LoginDto } from "@/domain/auth/dtos/login.dto";

import type { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

import { processValidationError } from "../../../helpers/validators/processError.validator";
import { userSchemas } from "./schemas/auth.schemas";

const loginSchema = z.object({
  email: userSchemas.email,
  password: userSchemas.password,
});

type ILoginSchema = z.infer<typeof loginSchema>;

export class LoginValidator {
  static validate(data: TRawJson): LoginDto {
    try {
      const validatedData: ILoginSchema = loginSchema.parse(data);

      const [error, loginDto] = LoginDto.createFrom(validatedData);

      if (error) {
        throw new BadRequestError(error);
      }

      return loginDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
