import { z } from "zod";
import { processValidationError } from "../processError.validator";
import { ValidationError } from "@/domain/errors/validation-error";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import globalStrings from "@/config/strings/global.strings.json";

const { DATA_VALIDATION } = globalStrings.ERRORS;

describe("processValidationError", () => {
  it("should throw ValidationError when ZodError has issues", () => {
    const schema = z.object({ email: z.string() });
    let zodError: z.ZodError;
    
    try {
      schema.parse({ email: 123 });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    expect(() => processValidationError(zodError!)).toThrow(ValidationError);
  });

  it("should set correct field when ZodError has path", () => {
    const schema = z.object({ 
      user: z.object({ 
        email: z.string().email() 
      }) 
    });
    let zodError: z.ZodError;
    
    try {
      schema.parse({ user: { email: "invalid-email" } });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    try {
      processValidationError(zodError!);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).field).toBe("user.email");
      expect((error as ValidationError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("should throw BadRequestError when ZodError has no issues", () => {
    const zodError = new z.ZodError([]);

    expect(() => processValidationError(zodError)).toThrow(BadRequestError);
    expect(() => processValidationError(zodError)).toThrow(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  });

  it("should re-throw ValidationError when error is already ValidationError", () => {
    const validationError = new ValidationError("Custom validation error", "customField", "CUSTOM_CODE");

    expect(() => processValidationError(validationError)).toThrow(ValidationError);
    expect(() => processValidationError(validationError)).toThrow("Custom validation error");
  });

  it("should preserve ValidationError properties when re-throwing", () => {
    const validationError = new ValidationError("Custom validation error", "customField", "CUSTOM_CODE");

    try {
      processValidationError(validationError);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).field).toBe("customField");
      expect((error as ValidationError).code).toBe("CUSTOM_CODE");
      expect((error as ValidationError).message).toBe("Custom validation error");
    }
  });

  it("should re-throw BadRequestError when error is already BadRequestError", () => {
    const badRequestError = new BadRequestError("Custom bad request error");

    expect(() => processValidationError(badRequestError)).toThrow(BadRequestError);
    expect(() => processValidationError(badRequestError)).toThrow("Custom bad request error");
  });

  it("should throw BadRequestError for unknown error types", () => {
    const unknownError = new Error("Some unknown error");

    expect(() => processValidationError(unknownError)).toThrow(BadRequestError);
    expect(() => processValidationError(unknownError)).toThrow(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  });

  it("should throw BadRequestError for string errors", () => {
    const stringError = "String error message";

    expect(() => processValidationError(stringError)).toThrow(BadRequestError);
    expect(() => processValidationError(stringError)).toThrow(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  });

  it("should throw BadRequestError for null errors", () => {
    expect(() => processValidationError(null)).toThrow(BadRequestError);
    expect(() => processValidationError(null)).toThrow(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  });

  it("should throw BadRequestError for undefined errors", () => {
    expect(() => processValidationError(undefined)).toThrow(BadRequestError);
    expect(() => processValidationError(undefined)).toThrow(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
  });

  it("should handle ZodError with multiple issues by taking the first one", () => {
    const schema = z.object({
      email: z.string(),
      password: z.string().min(8)
    });
    let zodError: z.ZodError;
    
    try {
      schema.parse({ email: 123, password: "short" });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    try {
      processValidationError(zodError!);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).field).toBe("email");
    }
  });

  it("should handle ZodError with empty path", () => {
    const schema = z.string();
    let zodError: z.ZodError;
    
    try {
      schema.parse(123);
    } catch (error) {
      zodError = error as z.ZodError;
    }

    try {
      processValidationError(zodError!);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).field).toBe("");
    }
  });
});