import { RegisterDto } from "../register.dto";
import { clearAllMocks } from "@/tests/test-utils";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

describe("RegisterDto", () => {
  let validData: TRawJson;
  beforeEach(() => {
    validData = {
      name: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: "securePassword123",
      role: "USER",
    };
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create RegisterDto successfully with valid data", () => {
      const [error, dto] = RegisterDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto!.name).toBe("John");
      expect(dto!.lastname).toBe("Doe");
      expect(dto!.email).toBe("john.doe@example.com");
      expect(dto!.password).toBe("securePassword123");
      expect(dto!.role).toBe("USER");
    });

    it("should return error when name is missing", () => {
      const { name, ...invalidData } = validData;

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(name).toBeDefined();
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when lastname is missing", () => {
      const { lastname, ...invalidData } = validData;

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(lastname).toBeDefined();
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is missing", () => {
      const { email, ...invalidData } = validData;

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(email).toBeDefined();
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when password is missing", () => {
      const { password, ...invalidData } = validData;

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(password).toBeDefined();
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when role is missing", () => {
      const { role, ...invalidData } = validData;

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(role).toBeDefined();
      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when all fields are missing", () => {
      const invalidData = {};

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when fields are empty strings", () => {
      const invalidData = {
        name: "",
        lastname: "",
        email: "",
        password: "",
        role: "",
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when fields are null", () => {
      const invalidData = {
        name: null,
        lastname: null,
        email: null,
        password: null,
        role: null,
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when fields are undefined", () => {
      const invalidData = {
        name: undefined,
        lastname: undefined,
        email: undefined,
        password: undefined,
        role: undefined,
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should handle extra properties in input data", () => {
      const dataWithExtraProps = {
        ...validData,
        extraField: "should be ignored",
        anotherField: 123,
      };

      const [error, dto] = RegisterDto.createFrom(dataWithExtraProps);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto!.name).toBe("John");
      expect(dto!.lastname).toBe("Doe");
      expect(dto!.email).toBe("john.doe@example.com");
      expect(dto!.password).toBe("securePassword123");
      expect(dto!.role).toBe("USER");
      expect((dto as TRawJson).extraField).toBeUndefined();
      expect((dto as TRawJson).anotherField).toBeUndefined();
    });

    it("should create a dto with phone number", () => {
      const data = {
        ...validData,
        phone: "+1234567890",
      };

      const [error, dto] = RegisterDto.createFrom(data);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto!.name).toBe("John");
      expect(dto!.lastname).toBe("Doe");
      expect(dto!.email).toBe("john.doe@example.com");
      expect(dto!.password).toBe("securePassword123");
      expect(dto!.role).toBe("USER");
      expect(dto!.phone).toBe("+1234567890");
    });

    it("should create a dto with metadata", () => {
      const data = {
        ...validData,
        metadata: {
          display_name: "John Doe",
          email_verified: true,
        },
      };

      const [error, dto] = RegisterDto.createFrom(data);

      expect(error).toBeUndefined();
      expect(dto).toBeDefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto!.name).toBe("John");
      expect(dto!.lastname).toBe("Doe");
      expect(dto!.email).toBe("john.doe@example.com");
      expect(dto!.password).toBe("securePassword123");
      expect(dto!.metadata?.display_name).toBe("John Doe");
      expect(dto!.metadata?.email_verified).toBe(true);
    });
  });
});
