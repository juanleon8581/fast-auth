import { EncryptedBodyDto } from "@/domain/crypto/dtos/encrypted-body.dto";
import { ERRORS } from "@/config/strings/global.strings.json";

describe("EncryptedBodyDto", () => {
  const validEncryption = {
    alg: "RSA-OAEP" as const,
    hash: "SHA-256" as const,
    enc: "AES-GCM" as const,
    kid: "public-key-001.der",
    iv: "AAAAAAAAAAAA", // base64url-like placeholder
    wrappedKey: "BBBBBBBBBBBB",
  };

  const validSignature = {
    alg: "HS256" as const,
    value: "CCCCCCCCCCCC",
    // Note: runtime type can be string when coming from validator.
    // For DTO direct tests, use Date to satisfy interface.
    timestamp: new Date(),
  };

  const validEncryptedPayload = "DDDDDDDDDDDD";

  describe("constructor", () => {
    it("should create immutable instance with provided properties", () => {
      const dto = new EncryptedBodyDto(
        validEncryption,
        validSignature,
        validEncryptedPayload,
      );

      expect(dto.encryption).toEqual(validEncryption);
      expect(dto.signature).toEqual(validSignature);
      expect(dto.encryptedPayload).toBe(validEncryptedPayload);
      expect(Object.isFrozen(dto)).toBe(true);
    });
  });

  describe("create", () => {
    it("should create EncryptedBodyDto from IEncryptedBody", () => {
      const dto = EncryptedBodyDto.create({
        encryption: validEncryption,
        signature: validSignature,
        encryptedPayload: validEncryptedPayload,
      });

      expect(dto).toBeInstanceOf(EncryptedBodyDto);
      expect(dto.encryptedPayload).toBe(validEncryptedPayload);
      expect(Object.isFrozen(dto)).toBe(true);
    });
  });

  describe("createFrom", () => {
    it("should return tuple [undefined, dto] for valid raw data", () => {
      const [error, dto] = EncryptedBodyDto.createFrom({
        encryption: validEncryption,
        signature: validSignature,
        encryptedPayload: validEncryptedPayload,
      });

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(EncryptedBodyDto);
      expect(dto!.encryptedPayload).toBe(validEncryptedPayload);
    });

    it("should return error string when required fields are missing", () => {
      const [error] = EncryptedBodyDto.createFrom({});
      expect(error).toBe(ERRORS.DATA_VALIDATION.INVALID_DATA);
    });
  });
});
