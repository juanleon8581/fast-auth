import { SyncUserFromAuthDto } from "../sync-user-from-auth.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { clearAllMocks } from "@/tests/test-utils";

describe("SyncUserFromAuthDto", () => {
  let validData: TRawJson;
  beforeEach(() => {
    validData = {
      id: "user-1",
      email: "user@example.com",
      name: "John",
      lastname: "Doe",
      display_name: "John Doe",
      role: "USER",
    };
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create the DTO with required fields", () => {
      const raw = { ...validData };

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);
      expect(Object.isFrozen(dto!)).toBe(true);

      // Access via any to inspect private fields at runtime
      expect(dto!.id).toBe("user-1");
      expect(dto!.email).toBe("user@example.com");
      expect(dto!.name).toBe("John");
      expect(dto!.lastname).toBe("Doe");
      expect(dto!.display_name).toBe("John Doe");
      expect(dto!.role).toBe("USER");
      expect(dto!.email_verified).toBeUndefined();
      expect(dto!.phone).toBeUndefined();
    });

    it("should set optional fields when provided", () => {
      const raw = {
        ...validData,
        email_verified: false,
        phone: "+34123456789",
      };

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);

      expect(dto!.email_verified).toBe(false);
      expect(dto!.phone).toBe("+34123456789");
    });

    it("should ignore extra properties in the payload", () => {
      const raw = {
        ...validData,
        extraField: "should be ignored",
      };

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);
      expect((dto as any).extraField).toBeUndefined();
    });

    it("should return an error when required field is missing", () => {
      const requiredFields = [
        "id",
        "email",
        "name",
        "lastname",
        "display_name",
        "role",
      ];

      requiredFields.forEach((field) => {
        const raw = { ...validData };
        delete raw[field];

        const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

        expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
        expect(dto).toBeUndefined();
      });
    });

    it("should return an error when required field are empty strings", () => {
      const requiredFields = [
        "id",
        "email",
        "name",
        "lastname",
        "display_name",
        "role",
      ];

      requiredFields.forEach((field) => {
        const raw = { ...validData };
        raw[field] = "";

        const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

        expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
        expect(dto).toBeUndefined();
      });
    });

    it("should return an error when required field are null", () => {
      const requiredFields = [
        "id",
        "email",
        "name",
        "lastname",
        "display_name",
        "role",
      ];

      requiredFields.forEach((field) => {
        const raw = { ...validData };
        raw[field] = null;

        const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

        expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
        expect(dto).toBeUndefined();
      });
    });

    it("should return an error when required field are undefined", () => {
      const requiredFields = [
        "id",
        "email",
        "name",
        "lastname",
        "display_name",
        "role",
      ];

      requiredFields.forEach((field) => {
        const raw = { ...validData };
        raw[field] = undefined;

        const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

        expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
        expect(dto).toBeUndefined();
      });
    });
  });
});
