import { EncryptedBodyValidator } from "@/infrastructure/validators/encrypted-body.validator";
import { EncryptedBodyDto } from "@/domain/crypto/dtos/encrypted-body.dto";
import { ValidationError } from "@/domain/errors/validation-error";

describe("EncryptedBodyValidator", () => {
  const base64url = (buf: Buffer) => buf.toString("base64url");

  const validIv = base64url(Buffer.alloc(12, 1));
  const validWrappedKey = base64url(Buffer.from("wrapped-key"));
  const validCipher = base64url(Buffer.from("cipher-text"));
  const validSignatureValue = base64url(Buffer.from("signature"));

  const validData = {
    encryption: {
      alg: "RSA-OAEP" as const,
      hash: "SHA-256" as const,
      enc: "AES-GCM" as const,
      kid: "public-key-001.der",
      iv: validIv,
      wrappedKey: validWrappedKey,
    },
    signature: {
      alg: "HS256" as const,
      value: validSignatureValue,
      timestamp: new Date().toISOString(),
    },
    encryptedPayload: validCipher,
  };

  describe("validate", () => {
    it("should return EncryptedBodyDto when data is valid", () => {
      const result = EncryptedBodyValidator.validate(validData);
      expect(result).toBeInstanceOf(EncryptedBodyDto);
      expect(result.encryptedPayload).toBe(validData.encryptedPayload);
      expect(result.encryption.iv).toBe(validIv);
    });

    it("should throw ValidationError when iv is not base64url", () => {
      const invalidData = {
        ...validData,
        encryption: { ...validData.encryption, iv: "invalid==iv" },
      };

      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        "iv must be base64url",
      );
    });

    it("should throw ValidationError when encryptedPayload is not base64url", () => {
      const invalidData = { ...validData, encryptedPayload: "bad/payload==" };

      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        "encryptedPayload must be base64url",
      );
    });

    it("should throw ValidationError when signature value is missing", () => {
      const invalidData = {
        ...validData,
        signature: { ...validData.signature, value: "" },
      };

      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => EncryptedBodyValidator.validate(invalidData)).toThrow(
        "signature value is required",
      );
    });
  });
});
