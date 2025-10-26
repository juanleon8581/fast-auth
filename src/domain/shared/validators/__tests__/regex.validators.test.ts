import {
  PERSON_NAME_PATTERN,
  STRONG_PASSWORD_PATTERN,
  EMAIL_BASIC_REGEX,
  PHONE_INTERNATIONAL_REGEX,
  POSTAL_CODE_REGEX,
  URL_REGEX,
} from "../regex.validators";

describe("Validation Regex Patterns", () => {
  describe("PERSON_NAME_PATTERN", () => {
    const validNames = [
      "Juan",
      "María",
      "José Luis",
      "Ana María",
      "Ángela",
      "Íñigo",
      "Núñez",
    ];

    const invalidNames = [
      "Juan123",
      "María@",
      "Ana_María",
      "Juan!",
      "",
    ];

    it("accepts valid names", () => {
      validNames.forEach((name) => {
        expect(PERSON_NAME_PATTERN.test(name)).toBe(true);
      });
    });

    it("rejects invalid names", () => {
      invalidNames.forEach((name) => {
        expect(PERSON_NAME_PATTERN.test(name)).toBe(false);
      });
    });
  });

  describe("STRONG_PASSWORD_PATTERN", () => {
    const validPasswords = [
      "Password123!",
      "MySecure@Pass1",
      "Strong#Password9",
    ];

    const invalidPasswords = [
      "password123!", // No uppercase
      "PASSWORD123!", // No lowercase
      "Password!", // No number
      "Password123", // No special char
      "",
    ];

    it("accepts valid passwords", () => {
      validPasswords.forEach((pwd) => {
        expect(STRONG_PASSWORD_PATTERN.test(pwd)).toBe(true);
      });
    });

    it("rejects invalid passwords", () => {
      invalidPasswords.forEach((pwd) => {
        expect(STRONG_PASSWORD_PATTERN.test(pwd)).toBe(false);
      });
    });
  });

  describe("EMAIL_BASIC_REGEX", () => {
    it("validates basic email format", () => {
      expect(EMAIL_BASIC_REGEX.test("user@example.com")).toBe(true);
      expect(EMAIL_BASIC_REGEX.test("invalid-email")).toBe(false);
      expect(EMAIL_BASIC_REGEX.test("user@com")).toBe(false);
    });
  });

  describe("PHONE_INTERNATIONAL_REGEX", () => {
    it("validates international phone numbers", () => {
      expect(PHONE_INTERNATIONAL_REGEX.test("+1234567890")).toBe(true);
      expect(PHONE_INTERNATIONAL_REGEX.test("1234567890")).toBe(false);
      expect(PHONE_INTERNATIONAL_REGEX.test("+1a34567890")).toBe(false);
    });
  });

  describe("POSTAL_CODE_REGEX", () => {
    it("validates general postal code format", () => {
      expect(POSTAL_CODE_REGEX.test("28080")).toBe(true);
      expect(POSTAL_CODE_REGEX.test("12")).toBe(false);
      expect(POSTAL_CODE_REGEX.test("12345678901")).toBe(false);
    });
  });

  describe("URL_REGEX", () => {
    it("validates http/https URLs", () => {
      expect(URL_REGEX.test("https://example.com/path?query=value#fragment")).toBe(true);
      expect(URL_REGEX.test("ftp://example.com")).toBe(false);
      expect(URL_REGEX.test("example.com")).toBe(false);
    });
  });

  describe("Regex Pattern Properties", () => {
    it("exports are RegExp instances and not global", () => {
      const patterns = [
        PERSON_NAME_PATTERN,
        STRONG_PASSWORD_PATTERN,
        EMAIL_BASIC_REGEX,
        PHONE_INTERNATIONAL_REGEX,
        POSTAL_CODE_REGEX,
        URL_REGEX,
      ];

      patterns.forEach((p) => {
        expect(p).toBeInstanceOf(RegExp);
        expect(p.global).toBe(false);
      });
    });
  });
});