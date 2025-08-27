import {
  NAME_LASTNAME_REGEX,
  SECURE_PASSWORD_REGEX,
  EMAIL_BASIC_REGEX,
  PHONE_INTERNATIONAL_REGEX,
  POSTAL_CODE_REGEX,
  URL_REGEX,
} from "../validations.regex";

describe("Validation Regex Patterns", () => {
  describe("NAME_LASTNAME_REGEX", () => {
    describe("Valid names", () => {
      const validNames = [
        "Juan",
        "María",
        "José Luis",
        "Ana María",
        "Francisco Javier",
        "Ángela",
        "Iñigo",
        "Núñez",
        "José María de la Cruz",
        "María José",
        "Óscar",
        "Úrsula",
        "Érica",
        "Íñigo",
      ];

      validNames.forEach((name) => {
        it(`should accept valid name: "${name}"`, () => {
          expect(NAME_LASTNAME_REGEX.test(name)).toBe(true);
        });
      });
    });

    describe("Invalid names", () => {
      const invalidNames = [
        "Juan123",
        "María@",
        "José-Luis",
        "Ana_María",
        "Francisco.Javier",
        "Juan!",
        "María#",
        "José$",
        "123",
        "@#$",
        "",
      ];

      invalidNames.forEach((name) => {
        it(`should reject invalid name: "${name}"`, () => {
          expect(NAME_LASTNAME_REGEX.test(name)).toBe(false);
        });
      });
    });
  });

  describe("SECURE_PASSWORD_REGEX", () => {
    describe("Valid passwords", () => {
      const validPasswords = [
        "Password123!",
        "MySecure@Pass1",
        "Strong#Password9",
        "Complex$Pass123",
        "Secure&Password1",
        "Valid*Pass123",
        "Good?Password1",
        "Test@123Password",
        "Example#Pass1",
        "Demo$Password123",
      ];

      validPasswords.forEach((password) => {
        it(`should accept valid password: "${password}"`, () => {
          expect(SECURE_PASSWORD_REGEX.test(password)).toBe(true);
        });
      });
    });

    describe("Invalid passwords", () => {
      const invalidPasswords = [
        "password123!", // No uppercase
        "PASSWORD123!", // No lowercase
        "Password!", // No number
        "Password123", // No special character
        "password", // No uppercase, number, or special char
        "PASSWORD", // No lowercase, number, or special char
        "12345678", // No letters or special char
        "!@#$%^&*", // No letters or numbers
        "", // Empty string
        "Pass 123!", // Contains space (not allowed)
        "Passñ123!", // Contains ñ (not in allowed charset)
      ];

      invalidPasswords.forEach((password) => {
        it(`should reject invalid password: "${password}"`, () => {
          expect(SECURE_PASSWORD_REGEX.test(password)).toBe(false);
        });
      });
    });
  });

  describe("EMAIL_BASIC_REGEX", () => {
    describe("Valid emails", () => {
      const validEmails = [
        "user@example.com",
        "test.email@domain.org",
        "user+tag@example.co.uk",
        "firstname.lastname@company.com",
        "user123@test-domain.com",
        "admin@localhost.dev",
        "contact@my-site.net",
        "info@example-site.io",
        "support@test.museum",
        "hello@world.travel",
      ];

      validEmails.forEach((email) => {
        it(`should accept valid email: "${email}"`, () => {
          expect(EMAIL_BASIC_REGEX.test(email)).toBe(true);
        });
      });
    });

    describe("Invalid emails", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user@com",
        "user name@example.com",
        "user@exam ple.com",
        "user@@example.com",
        "user@@example.com", // Double @ symbol
        "",
        "user@",
        "@domain.com",
      ];

      invalidEmails.forEach((email) => {
        it(`should reject invalid email: "${email}"`, () => {
          expect(EMAIL_BASIC_REGEX.test(email)).toBe(false);
        });
      });
    });
  });

  describe("PHONE_INTERNATIONAL_REGEX", () => {
    describe("Valid phone numbers", () => {
      const validPhones = [
        "+1234567890",
        "+12345678901234",
        "+521234567890",
        "+34123456789",
        "+44123456789",
        "+81123456789",
        "+86123456789",
        "+33123456789",
        "+49123456789",
        "+39123456789",
      ];

      validPhones.forEach((phone) => {
        it(`should accept valid phone: "${phone}"`, () => {
          expect(PHONE_INTERNATIONAL_REGEX.test(phone)).toBe(true);
        });
      });
    });

    describe("Invalid phone numbers", () => {
      const invalidPhones = [
        "1234567890", // No + prefix
        "+0123456789", // Starts with 0
        "+12", // Too short
        "+123456789012345678", // Too long
        "+1-234-567-890", // Contains hyphens
        "+1 234 567 890", // Contains spaces
        "+1(234)567-890", // Contains parentheses
        "+abc123456789", // Contains letters
        "+1234567890a", // Contains letters at end
        "", // Empty string
        "+", // Just plus sign
        "++1234567890", // Double plus
      ];

      invalidPhones.forEach((phone) => {
        it(`should reject invalid phone: "${phone}"`, () => {
          expect(PHONE_INTERNATIONAL_REGEX.test(phone)).toBe(false);
        });
      });
    });
  });

  describe("POSTAL_CODE_REGEX", () => {
    describe("Valid postal codes", () => {
      const validPostalCodes = [
        "1234",
        "12345",
        "123456",
        "1234567",
        "12345678",
        "123456789",
        "1234567890",
        "0000",
        "9999",
        "0123",
      ];

      validPostalCodes.forEach((code) => {
        it(`should accept valid postal code: "${code}"`, () => {
          expect(POSTAL_CODE_REGEX.test(code)).toBe(true);
        });
      });
    });

    describe("Invalid postal codes", () => {
      const invalidPostalCodes = [
        "123", // Too short
        "12345678901", // Too long
        "12345a", // Contains letters
        "1234-5678", // Contains hyphen
        "1234 5678", // Contains space
        "ABCD", // All letters
        "12.34", // Contains dot
        "", // Empty string
        "12/34", // Contains slash
        "12,34", // Contains comma
      ];

      invalidPostalCodes.forEach((code) => {
        it(`should reject invalid postal code: "${code}"`, () => {
          expect(POSTAL_CODE_REGEX.test(code)).toBe(false);
        });
      });
    });
  });

  describe("URL_REGEX", () => {
    describe("Valid URLs", () => {
      const validUrls = [
        "http://example.com",
        "https://example.com",
        "http://www.example.com",
        "https://www.example.com",
        "https://example.com/path",
        "https://example.com/path/to/resource",
        "https://example.com?query=value",
        "https://example.com#fragment",
        "https://example.com/path?query=value#fragment",
        "https://subdomain.example.com",
        "https://example.co.uk",
        "https://example.museum",
        "https://localhost.dev",
        "http://192.168.1.1",
        "https://example.com:8080/path",
      ];

      validUrls.forEach((url) => {
        it(`should accept valid URL: "${url}"`, () => {
          expect(URL_REGEX.test(url)).toBe(true);
        });
      });
    });

    describe("Invalid URLs", () => {
      const invalidUrls = [
        "ftp://example.com", // Wrong protocol
        "example.com", // No protocol
        "http://", // No domain
        "https://", // No domain
        "http://example", // No TLD
        "http://.com", // No domain name
        "http://example.", // No TLD
        "http://exam ple.com", // Space in domain
        "", // Empty string
        "not-a-url",
        "https://example.toolongtobevalid", // TLD too long
      ];

      invalidUrls.forEach((url) => {
        it(`should reject invalid URL: "${url}"`, () => {
          expect(URL_REGEX.test(url)).toBe(false);
        });
      });
    });
  });

  describe("Regex Pattern Properties", () => {
    it("should have all regex patterns defined", () => {
      expect(NAME_LASTNAME_REGEX).toBeInstanceOf(RegExp);
      expect(SECURE_PASSWORD_REGEX).toBeInstanceOf(RegExp);
      expect(EMAIL_BASIC_REGEX).toBeInstanceOf(RegExp);
      expect(PHONE_INTERNATIONAL_REGEX).toBeInstanceOf(RegExp);
      expect(POSTAL_CODE_REGEX).toBeInstanceOf(RegExp);
      expect(URL_REGEX).toBeInstanceOf(RegExp);
    });

    it("should have correct regex flags", () => {
      // Most patterns should not have global flag for validation purposes
      expect(NAME_LASTNAME_REGEX.global).toBe(false);
      expect(SECURE_PASSWORD_REGEX.global).toBe(false);
      expect(EMAIL_BASIC_REGEX.global).toBe(false);
      expect(PHONE_INTERNATIONAL_REGEX.global).toBe(false);
      expect(POSTAL_CODE_REGEX.global).toBe(false);
      expect(URL_REGEX.global).toBe(false);
    });

    it("should be exportable and importable", () => {
      // This test verifies that all exports are accessible
      expect(typeof NAME_LASTNAME_REGEX).toBe("object");
      expect(typeof SECURE_PASSWORD_REGEX).toBe("object");
      expect(typeof EMAIL_BASIC_REGEX).toBe("object");
      expect(typeof PHONE_INTERNATIONAL_REGEX).toBe("object");
      expect(typeof POSTAL_CODE_REGEX).toBe("object");
      expect(typeof URL_REGEX).toBe("object");
    });
  });
});
