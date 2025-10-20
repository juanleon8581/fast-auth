import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { CreateLogDto } from "@/domain/log/dtos/create-log.dto";
import {
  LOG_LEVELS,
  type LogLevel,
} from "@/domain/log/interfaces/log.interfaces";
import type { TRawJson } from "@/domain/interfaces/general.interfaces";
import { processValidationError } from "./utils/processError.validator";

const createLogSchema = z.object({
  level: z
    .string()
    .min(1, "Log level is required")
    .refine((val): val is LogLevel => LOG_LEVELS.includes(val as LogLevel), {
      message:
        "Invalid log level. Must be one of: ERROR, WARN, INFO, HTTP, VERBOSE, DEBUG, SILLY",
    }),
  message: z
    .string({ message: "Message is required" })
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters")
    .trim(),
  meta: z
    .record(z.string(), z.unknown())
    .optional()
    .refine((val) => !val || Object.keys(val).length <= 50, {
      message: "Meta object cannot have more than 50 keys",
    }),
  service: z
    .string()
    .min(1, "Service name cannot be empty")
    .max(100, "Service name cannot exceed 100 characters")
    .trim()
    .optional(),
  userId: z
    .string()
    .min(1, "User ID cannot be empty")
    .max(100, "User ID cannot exceed 100 characters")
    .trim()
    .optional(),
  requestId: z
    .string()
    .min(1, "Request ID cannot be empty")
    .max(100, "Request ID cannot exceed 100 characters")
    .trim()
    .optional(),
  error: z
    .string()
    .min(1, "Error message cannot be empty")
    .max(2000, "Error message cannot exceed 2000 characters")
    .trim()
    .optional(),
});

type ICreateLogSchema = z.infer<typeof createLogSchema>;

export class CreateLogValidator {
  static validate(data: TRawJson): CreateLogDto {
    try {
      const validatedData: ICreateLogSchema = createLogSchema.parse(data);

      const [dtoError, createLogDto] = CreateLogDto.createFrom(validatedData);

      if (dtoError) {
        throw new BadRequestError(dtoError);
      }

      return createLogDto!;
    } catch (error) {
      return processValidationError(error);
    }
  }

  /**
   * Validates log level only
   */
  static validateLogLevel(level: string): LogLevel {
    try {
      const levelSchema = z
        .string()
        .refine(
          (val): val is LogLevel => LOG_LEVELS.includes(val as LogLevel),
          { message: "Invalid log level" },
        );

      const result = levelSchema.parse(level);
      return result as LogLevel;
    } catch (error) {
      return processValidationError(error);
    }
  }

  /**
   * Validates message only
   */
  static validateMessage(message: string): string {
    try {
      return z
        .string()
        .min(1, "Message cannot be empty")
        .max(1000, "Message cannot exceed 1000 characters")
        .trim()
        .parse(message);
    } catch (error) {
      return processValidationError(error);
    }
  }
}
