import { z } from "zod";
import { ValidationError } from "@/domain/errors/validation-error";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import globalStrings from "@/config/strings/global.strings.json";

const { DATA_VALIDATION } = globalStrings.ERRORS;

export const processValidationError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    const firstError = error.issues[0];
    if (firstError) {
      const field = firstError.path.join(".");
      throw new ValidationError(firstError.message, field, "VALIDATION_ERROR");
    }
    throw new BadRequestError(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  }

  if (error instanceof ValidationError || error instanceof BadRequestError) {
    throw error;
  }

  throw new BadRequestError(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
};
