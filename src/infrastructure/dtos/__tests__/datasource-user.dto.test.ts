import { DatasourceUserDto } from "../datasource-user.dto";
import type { User } from "@supabase/supabase-js";
import { ERRORS } from "@/config/strings/global.strings.json";

describe("DatasourceUserDto", () => {
  describe("constructor", () => {
    it("should create DatasourceUserDto instance with all properties", () => {
      const dto = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      expect(dto.id).toBe("user-123");
      expect(dto.email).toBe("test@example.com");
      expect(dto.name).toBe("John Doe");
      expect(dto.email_verified).toBe(true);
      expect(dto.phone).toBe("+1234567890");
    });

    it("should create DatasourceUserDto instance without optional phone", () => {
      const dto = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        false,
      );

      expect(dto.id).toBe("user-123");
      expect(dto.email).toBe("test@example.com");
      expect(dto.name).toBe("John Doe");
      expect(dto.email_verified).toBe(false);
      expect(dto.phone).toBeUndefined();
    });

    it("should freeze the instance to prevent modifications", () => {
      const dto = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        true,
      );

      expect(Object.isFrozen(dto)).toBe(true);

      // Attempt to modify should not work
      expect(() => {
        (dto as any).id = "new-id";
      }).toThrow();
    });

    it("should have readonly properties", () => {
      const dto = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        true,
      );

      // TypeScript should enforce readonly, but we can test the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(dto, "id");
      expect(descriptor?.writable).toBe(false);
    });
  });

  describe("createFrom static method", () => {
    describe("successful creation", () => {
      it("should create DatasourceUserDto from valid Supabase User with email verified", () => {
        const mockUser = {
          id: "user-123",
          email: "test@example.com",
          email_confirmed_at: "2024-01-01T00:00:00Z",
          phone: "+1234567890",
          user_metadata: {
            display_name: "John Doe",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBeUndefined();
        expect(dto).toBeInstanceOf(DatasourceUserDto);
        expect(dto?.id).toBe("user-123");
        expect(dto?.email).toBe("test@example.com");
        expect(dto?.name).toBe("John Doe");
        expect(dto?.email_verified).toBe(true);
        expect(dto?.phone).toBe("+1234567890");
      });

      it("should create DatasourceUserDto from valid Supabase User with email not verified", () => {
        const mockUser = {
          id: "user-456",
          email: "unverified@example.com",
          email_confirmed_at: null,
          phone: null,
          user_metadata: {
            display_name: "Jane Smith",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBeUndefined();
        expect(dto).toBeInstanceOf(DatasourceUserDto);
        expect(dto?.id).toBe("user-456");
        expect(dto?.email).toBe("unverified@example.com");
        expect(dto?.name).toBe("Jane Smith");
        expect(dto?.email_verified).toBe(false);
        expect(dto?.phone).toBeNull();
      });

      it("should handle undefined phone correctly", () => {
        const mockUser = {
          id: "user-789",
          email: "nophone@example.com",
          email_confirmed_at: "2024-01-01T00:00:00Z",
          phone: undefined,
          user_metadata: {
            display_name: "No Phone User",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBeUndefined();
        expect(dto?.phone).toBeUndefined();
      });
    });

    describe("error handling", () => {
      it("should return error when id is missing", () => {
        const mockUser = {
          id: "",
          email: "test@example.com",
          user_metadata: {
            display_name: "John Doe",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });

      it("should return error when email is missing", () => {
        const mockUser = {
          id: "user-123",
          email: "",
          user_metadata: {
            display_name: "John Doe",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });

      it("should return error when name is missing from user_metadata", () => {
        const mockUser = {
          id: "user-123",
          email: "test@example.com",
          user_metadata: {},
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });

      it("should return error when user_metadata is missing", () => {
        const mockUser = {
          id: "user-123",
          email: "test@example.com",
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });

      it("should return error when display_name is empty string", () => {
        const mockUser = {
          id: "user-123",
          email: "test@example.com",
          user_metadata: {
            display_name: "",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });

      it("should return error when id is null", () => {
        const mockUser = {
          id: null as any,
          email: "test@example.com",
          user_metadata: {
            display_name: "John Doe",
          },
        } as unknown as User;

        const [error, dto] = DatasourceUserDto.createFrom(mockUser);

        expect(error).toBe(ERRORS.AUTH.LOGIN.INVALID_DATA_RECEIVED);
        expect(dto).toBeUndefined();
      });
    });

    describe("return type validation", () => {
      it("should return tuple with error as first element on failure", () => {
        const mockUser = {
          id: "",
          email: "test@example.com",
        } as unknown as User;

        const result = DatasourceUserDto.createFrom(mockUser);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        expect(typeof result[0]).toBe("string");
      });

      it("should return tuple with dto as second element on success", () => {
        const mockUser = {
          id: "user-123",
          email: "test@example.com",
          user_metadata: {
            display_name: "John Doe",
          },
        } as unknown as User;

        const result = DatasourceUserDto.createFrom(mockUser);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0]).toBeUndefined();
        expect(result[1]).toBeInstanceOf(DatasourceUserDto);
      });
    });
  });

  describe("interface compliance", () => {
    it("should implement IDatasourceUserDto interface", () => {
      const dto = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      // Check that all required properties exist
      expect(dto).toHaveProperty("id");
      expect(dto).toHaveProperty("email");
      expect(dto).toHaveProperty("name");
      expect(dto).toHaveProperty("email_verified");
      expect(dto).toHaveProperty("phone");

      // Check property types
      expect(typeof dto.id).toBe("string");
      expect(typeof dto.email).toBe("string");
      expect(typeof dto.name).toBe("string");
      expect(typeof dto.email_verified).toBe("boolean");
    });

    it("should handle optional phone property correctly", () => {
      const dtoWithPhone = new DatasourceUserDto(
        "user-123",
        "test@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      const dtoWithoutPhone = new DatasourceUserDto(
        "user-456",
        "test2@example.com",
        "Jane Doe",
        false,
      );

      expect(typeof dtoWithPhone.phone).toBe("string");
      expect(dtoWithoutPhone.phone).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle very long names", () => {
      const longName = "A".repeat(1000);
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {
          display_name: longName,
        },
      } as unknown as User;

      const [error, dto] = DatasourceUserDto.createFrom(mockUser);

      expect(error).toBeUndefined();
      expect(dto?.name).toBe(longName);
    });

    it("should handle special characters in name", () => {
      const specialName = "José María Ñoño-García";
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {
          display_name: specialName,
        },
      } as unknown as User;

      const [error, dto] = DatasourceUserDto.createFrom(mockUser);

      expect(error).toBeUndefined();
      expect(dto?.name).toBe(specialName);
    });

    it("should handle email_confirmed_at as string", () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        email_confirmed_at: "2024-01-01T00:00:00Z",
        user_metadata: {
          display_name: "John Doe",
        },
      } as unknown as User;

      const [error, dto] = DatasourceUserDto.createFrom(mockUser);

      expect(error).toBeUndefined();
      expect(dto?.email_verified).toBe(true);
    });
  });
});
