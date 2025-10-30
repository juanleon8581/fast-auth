import { z } from "zod";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import type { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { EncryptedBodyDto } from "@/domain/crypto/dtos/encrypted-body.dto";
import { processValidationError } from "@/infrastructure/helpers/validators/processError.validator";

// Base64url regex: URL-safe base64 without padding
const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/;

const encryptedPayloadSchema = z.object({
  encryption: z.object({
    alg: z.enum(["RSA-OAEP", "HS256"]),
    hash: z.literal("SHA-256"),
    enc: z.literal("AES-GCM"),
    kid: z.string().min(1, "kid is required"),
    iv: z
      .string()
      .min(1, "iv is required")
      .regex(BASE64URL_REGEX, "iv must be base64url"),
    wrappedKey: z
      .string()
      .min(1, "wrappedKey is required")
      .regex(BASE64URL_REGEX, "wrappedKey must be base64url"),
  }),
  signature: z.object({
    alg: z.enum(["RSA-OAEP", "HS256"]),
    value: z
      .string()
      .min(1, "signature value is required")
      .regex(BASE64URL_REGEX, "signature value must be base64url"),
    timestamp: z.iso.datetime(),
  }),
  encryptedPayload: z
    .string()
    .min(1, "encryptedPayload is required")
    .regex(BASE64URL_REGEX, "encryptedPayload must be base64url"),
});

type IEncryptedBodySchema = z.infer<typeof encryptedPayloadSchema>;

export class EncryptedBodyValidator {
  static validate(data: TRawJson): EncryptedBodyDto {
    try {
      const validatedData: IEncryptedBodySchema =
        encryptedPayloadSchema.parse(data);

      const [error, dto] = EncryptedBodyDto.createFrom(validatedData);

      if (error) {
        throw new BadRequestError(error);
      }

      return dto!;
    } catch (error) {
      return processValidationError(error);
    }
  }
}
