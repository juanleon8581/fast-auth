import { SyncUserFromAuthDto } from "../sync-user-from-auth.dto";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { clearAllMocks } from "@/tests/test-utils";

describe("SyncUserFromAuthDto", () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create the DTO with required fields", () => {
      const raw = { id: "user-1", email: "user@example.com" };

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);
      expect(Object.isFrozen(dto!)).toBe(true);

      // Access via any to inspect private fields at runtime
      expect((dto as any).id).toBe("user-1");
      expect((dto as any).email).toBe("user@example.com");
      expect((dto as any).name).toBeUndefined();
      expect((dto as any).email_verified).toBeUndefined();
      expect((dto as any).phone).toBeUndefined();
    });

    it("should set optional fields when provided", () => {
      const raw = {
        id: "user-2",
        email: "user2@example.com",
        name: "Jane Doe",
        email_verified: false,
        phone: "+34123456789",
      };

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);

      expect((dto as any).id).toBe("user-2");
      expect((dto as any).email).toBe("user2@example.com");
      expect((dto as any).name).toBe("Jane Doe");
      expect((dto as any).email_verified).toBe(false);
      expect((dto as any).phone).toBe("+34123456789");
    });

    it("should ignore extra properties in the payload", () => {
      const raw = {
        id: "user-3",
        email: "user3@example.com",
        extraField: "should be ignored",
      } as unknown as Record<string, unknown>;

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(SyncUserFromAuthDto);
      expect((dto as any).extraField).toBeUndefined();
    });

    it("should return an error when id is missing", () => {
      const raw = { email: "user@example.com" } as Record<string, unknown>;

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto).toBeUndefined();
    });

    it("should return an error when email is missing", () => {
      const raw = { id: "user-4" } as Record<string, unknown>;

      const [error, dto] = SyncUserFromAuthDto.createFrom(raw);

      expect(error).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto).toBeUndefined();
    });

    it("should return an error when id or email are empty strings", () => {
      const [error1, dto1] = SyncUserFromAuthDto.createFrom({
        id: "",
        email: "user@example.com",
      });
      expect(error1).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto1).toBeUndefined();

      const [error2, dto2] = SyncUserFromAuthDto.createFrom({
        id: "user-5",
        email: "",
      });
      expect(error2).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto2).toBeUndefined();
    });

    it("should return an error when id or email are null/undefined", () => {
      const [error1, dto1] = SyncUserFromAuthDto.createFrom({
        id: null,
        email: "user@example.com",
      });
      expect(error1).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto1).toBeUndefined();

      const [error2, dto2] = SyncUserFromAuthDto.createFrom({
        id: "user-6",
        email: undefined,
      });
      expect(error2).toBe(ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA);
      expect(dto2).toBeUndefined();
    });
  });
});
