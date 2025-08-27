import globalStrings from "../global.strings.json";

describe("Global Strings Configuration", () => {
  describe("JSON Structure Validation", () => {
    it("should be a valid JSON object", () => {
      expect(typeof globalStrings).toBe("object");
      expect(globalStrings).not.toBeNull();
      expect(Array.isArray(globalStrings)).toBe(false);
    });

    it("should have ERRORS as root property", () => {
      expect(globalStrings).toHaveProperty("ERRORS");
      expect(typeof globalStrings.ERRORS).toBe("object");
    });

    it("should have main error categories", () => {
      const { ERRORS } = globalStrings;
      expect(ERRORS).toHaveProperty("DATA_VALIDATION");
      expect(ERRORS).toHaveProperty("AUTH");
      expect(ERRORS).toHaveProperty("LOGIN");
      expect(ERRORS).toHaveProperty("LOGOUT");
    });
  });

  describe("DATA_VALIDATION Error Messages", () => {
    const { DATA_VALIDATION } = globalStrings.ERRORS;

    it("should have all required data validation messages", () => {
      expect(DATA_VALIDATION).toHaveProperty("MISSING_FIELDS");
      expect(DATA_VALIDATION).toHaveProperty("INVALID_FIELDS");
      expect(DATA_VALIDATION).toHaveProperty("UNKNOWN_VALIDATION_ERROR");
      expect(DATA_VALIDATION).toHaveProperty("INVALID_DATA");
    });

    it("should have non-empty string messages", () => {
      expect(typeof DATA_VALIDATION.MISSING_FIELDS).toBe("string");
      expect(DATA_VALIDATION.MISSING_FIELDS.length).toBeGreaterThan(0);
      expect(typeof DATA_VALIDATION.INVALID_FIELDS).toBe("string");
      expect(DATA_VALIDATION.INVALID_FIELDS.length).toBeGreaterThan(0);
      expect(typeof DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR).toBe("string");
      expect(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR.length).toBeGreaterThan(
        0
      );
      expect(typeof DATA_VALIDATION.INVALID_DATA).toBe("string");
      expect(DATA_VALIDATION.INVALID_DATA.length).toBeGreaterThan(0);
    });

    it("should have meaningful error messages", () => {
      expect(DATA_VALIDATION.MISSING_FIELDS).toBe(
        "Required fields are missing"
      );
      expect(DATA_VALIDATION.INVALID_FIELDS).toBe("Invalid fields");
      expect(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR).toBe(
        "Unknown validation error"
      );
      expect(DATA_VALIDATION.INVALID_DATA).toBe("Invalid data");
    });
  });

  describe("AUTH Error Messages", () => {
    const { AUTH } = globalStrings.ERRORS;

    it("should have REGISTER section", () => {
      expect(AUTH).toHaveProperty("REGISTER");
      expect(typeof AUTH.REGISTER).toBe("object");
    });

    it("should have user creation error message", () => {
      expect(AUTH.REGISTER).toHaveProperty("USER_NO_CREATED");
      expect(typeof AUTH.REGISTER.USER_NO_CREATED).toBe("string");
      expect(AUTH.REGISTER.USER_NO_CREATED).toBe("User not created");
    });

    it("should have VALIDATION section in REGISTER", () => {
      expect(AUTH.REGISTER).toHaveProperty("VALIDATION");
      expect(typeof AUTH.REGISTER.VALIDATION).toBe("object");
    });

    describe("REGISTER Validation Messages", () => {
      const { VALIDATION } = AUTH.REGISTER;

      it("should have all field validation sections", () => {
        expect(VALIDATION).toHaveProperty("NAME");
        expect(VALIDATION).toHaveProperty("LASTNAME");
        expect(VALIDATION).toHaveProperty("EMAIL");
        expect(VALIDATION).toHaveProperty("PASSWORD");
      });

      describe("NAME validation messages", () => {
        const { NAME } = VALIDATION;

        it("should have all name validation messages", () => {
          expect(NAME).toHaveProperty("MIN_LENGTH");
          expect(NAME).toHaveProperty("MAX_LENGTH");
          expect(NAME).toHaveProperty("INVALID_FORMAT");
        });

        it("should have correct name validation messages", () => {
          expect(NAME.MIN_LENGTH).toBe(
            "Name must be at least 2 characters long"
          );
          expect(NAME.MAX_LENGTH).toBe("Name cannot exceed 50 characters");
          expect(NAME.INVALID_FORMAT).toBe(
            "Name can only contain letters and spaces"
          );
        });
      });

      describe("LASTNAME validation messages", () => {
        const { LASTNAME } = VALIDATION;

        it("should have all lastname validation messages", () => {
          expect(LASTNAME).toHaveProperty("MIN_LENGTH");
          expect(LASTNAME).toHaveProperty("MAX_LENGTH");
          expect(LASTNAME).toHaveProperty("INVALID_FORMAT");
        });

        it("should have correct lastname validation messages", () => {
          expect(LASTNAME.MIN_LENGTH).toBe(
            "Last name must be at least 2 characters long"
          );
          expect(LASTNAME.MAX_LENGTH).toBe(
            "Last name cannot exceed 50 characters"
          );
          expect(LASTNAME.INVALID_FORMAT).toBe(
            "Last name can only contain letters and spaces"
          );
        });
      });

      describe("EMAIL validation messages", () => {
        const { EMAIL } = VALIDATION;

        it("should have all email validation messages", () => {
          expect(EMAIL).toHaveProperty("INVALID_FORMAT");
          expect(EMAIL).toHaveProperty("MAX_LENGTH");
        });

        it("should have correct email validation messages", () => {
          expect(EMAIL.INVALID_FORMAT).toBe("Must be a valid email");
          expect(EMAIL.MAX_LENGTH).toBe("Email cannot exceed 100 characters");
        });
      });

      describe("PASSWORD validation messages", () => {
        const { PASSWORD } = VALIDATION;

        it("should have all password validation messages", () => {
          expect(PASSWORD).toHaveProperty("MIN_LENGTH");
          expect(PASSWORD).toHaveProperty("MAX_LENGTH");
          expect(PASSWORD).toHaveProperty("INVALID_FORMAT");
        });

        it("should have correct password validation messages", () => {
          expect(PASSWORD.MIN_LENGTH).toBe(
            "Password must be at least 8 characters long"
          );
          expect(PASSWORD.MAX_LENGTH).toBe(
            "Password cannot exceed 128 characters"
          );
          expect(PASSWORD.INVALID_FORMAT).toBe(
            "Password must contain at least: 1 lowercase, 1 uppercase, 1 number and 1 special character"
          );
        });
      });
    });
  });

  describe("LOGIN Error Messages", () => {
    const { LOGIN } = globalStrings.ERRORS;

    it("should have all login error messages", () => {
      expect(LOGIN).toHaveProperty("INVALID_DATA_RECEIVED");
      expect(LOGIN).toHaveProperty("USER_NOT_FOUND");
      expect(LOGIN).toHaveProperty("INVALID_CREDENTIALS");
      expect(LOGIN).toHaveProperty("VALIDATION");
    });

    it("should have correct login error messages", () => {
      expect(LOGIN.INVALID_DATA_RECEIVED).toBe("Invalid data received");
      expect(LOGIN.USER_NOT_FOUND).toBe("User not found");
      expect(LOGIN.INVALID_CREDENTIALS).toBe("Invalid credentials");
    });

    describe("LOGIN Validation Messages", () => {
      const { VALIDATION } = LOGIN;

      it("should have EMAIL and PASSWORD validation sections", () => {
        expect(VALIDATION).toHaveProperty("EMAIL");
        expect(VALIDATION).toHaveProperty("PASSWORD");
      });

      describe("LOGIN EMAIL validation messages", () => {
        const { EMAIL } = VALIDATION;

        it("should have all login email validation messages", () => {
          expect(EMAIL).toHaveProperty("REQUIRED");
          expect(EMAIL).toHaveProperty("INVALID_FORMAT");
          expect(EMAIL).toHaveProperty("MAX_LENGTH");
        });

        it("should have correct login email validation messages", () => {
          expect(EMAIL.REQUIRED).toBe("Email is required");
          expect(EMAIL.INVALID_FORMAT).toBe("Must be a valid email");
          expect(EMAIL.MAX_LENGTH).toBe("Email cannot exceed 100 characters");
        });
      });

      describe("LOGIN PASSWORD validation messages", () => {
        const { PASSWORD } = VALIDATION;

        it("should have all login password validation messages", () => {
          expect(PASSWORD).toHaveProperty("REQUIRED");
          expect(PASSWORD).toHaveProperty("MIN_LENGTH");
        });

        it("should have correct login password validation messages", () => {
          expect(PASSWORD.REQUIRED).toBe("Password is required");
          expect(PASSWORD.MIN_LENGTH).toBe(
            "Password must be at least 1 character long"
          );
        });
      });
    });
  });

  describe("LOGOUT Error Messages", () => {
    const { LOGOUT } = globalStrings.ERRORS;

    it("should have logout error message", () => {
      expect(LOGOUT).toHaveProperty("USER_NOT_LOGGED_OUT");
      expect(LOGOUT.USER_NOT_LOGGED_OUT).toBe("User not logged out");
    });

    it("should have VALIDATION section", () => {
      expect(LOGOUT).toHaveProperty("VALIDATION");
      expect(typeof LOGOUT.VALIDATION).toBe("object");
    });

    describe("LOGOUT Validation Messages", () => {
      const { VALIDATION } = LOGOUT;

      it("should have token validation sections", () => {
        expect(VALIDATION).toHaveProperty("ACCESS_TOKEN");
        expect(VALIDATION).toHaveProperty("REFRESH_TOKEN");
      });

      describe("ACCESS_TOKEN validation messages", () => {
        const { ACCESS_TOKEN } = VALIDATION;

        it("should have required message", () => {
          expect(ACCESS_TOKEN).toHaveProperty("REQUIRED");
          expect(ACCESS_TOKEN.REQUIRED).toBe("Access token is required");
        });
      });

      describe("REFRESH_TOKEN validation messages", () => {
        const { REFRESH_TOKEN } = VALIDATION;

        it("should have required message", () => {
          expect(REFRESH_TOKEN).toHaveProperty("REQUIRED");
          expect(REFRESH_TOKEN.REQUIRED).toBe("Refresh token is required");
        });
      });
    });
  });

  describe("Message Quality Validation", () => {
    const getAllMessages = (
      obj: any,
      path = ""
    ): Array<{ path: string; message: string }> => {
      const messages: Array<{ path: string; message: string }> = [];

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === "string") {
          messages.push({ path: currentPath, message: value });
        } else if (typeof value === "object" && value !== null) {
          messages.push(...getAllMessages(value, currentPath));
        }
      }

      return messages;
    };

    it("should have no empty string messages", () => {
      const allMessages = getAllMessages(globalStrings);
      const emptyMessages = allMessages.filter(
        ({ message }) => message.trim() === ""
      );

      expect(emptyMessages).toHaveLength(0);
    });

    it("should have meaningful message lengths", () => {
      const allMessages = getAllMessages(globalStrings);
      const shortMessages = allMessages.filter(
        ({ message }) => message.length < 5
      );

      expect(shortMessages).toHaveLength(0);
    });

    it("should have consistent capitalization", () => {
      const allMessages = getAllMessages(globalStrings);
      const inconsistentMessages = allMessages.filter(({ message }) => {
        // Check if message starts with lowercase (except for articles, prepositions)
        const firstChar = message.charAt(0);
        const firstWord = message.split(" ")[0];
        return (
          firstChar !== firstChar.toUpperCase() &&
          firstWord &&
          !["a", "an", "the", "of", "in", "on", "at"].includes(
            firstWord.toLowerCase()
          )
        );
      });

      expect(inconsistentMessages).toHaveLength(0);
    });

    it("should identify duplicate messages if any exist", () => {
      const allMessages = getAllMessages(globalStrings);
      const messageTexts = allMessages.map(({ message }) => message);
      const uniqueMessages = [...new Set(messageTexts)];

      // Find duplicates
      const duplicates: string[] = [];
      const seen = new Set<string>();

      for (const message of messageTexts) {
        if (seen.has(message) && !duplicates.includes(message)) {
          duplicates.push(message);
        }
        seen.add(message);
      }

      // Log duplicates for information (this test documents the current state)
      if (duplicates.length > 0) {
        console.log("Duplicate messages found:", duplicates);
      }

      // Currently there are 2 duplicate messages, this test documents the current state
      expect(messageTexts.length).toBe(27);
      expect(uniqueMessages.length).toBe(25);
      expect(duplicates.length).toBe(2);
    });
  });

  describe("Accessibility and Localization", () => {
    it("should be importable as a module", () => {
      expect(globalStrings).toBeDefined();
      expect(typeof globalStrings).toBe("object");
    });

    it("should have consistent structure depth", () => {
      // Verify that similar sections have similar depth
      const authRegisterValidation =
        globalStrings.ERRORS.AUTH.REGISTER.VALIDATION;
      const loginValidation = globalStrings.ERRORS.LOGIN.VALIDATION;
      const logoutValidation = globalStrings.ERRORS.LOGOUT.VALIDATION;

      expect(typeof authRegisterValidation).toBe("object");
      expect(typeof loginValidation).toBe("object");
      expect(typeof logoutValidation).toBe("object");
    });

    it("should follow consistent naming conventions", () => {
      const checkNamingConvention = (obj: any, path = ""): string[] => {
        const violations: string[] = [];

        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          // Check if key follows UPPER_SNAKE_CASE convention
          if (typeof value === "object" && value !== null) {
            if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
              violations.push(
                `Key '${key}' at path '${currentPath}' doesn't follow UPPER_SNAKE_CASE convention`
              );
            }
            violations.push(...checkNamingConvention(value, currentPath));
          } else if (typeof value === "string") {
            if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
              violations.push(
                `Key '${key}' at path '${currentPath}' doesn't follow UPPER_SNAKE_CASE convention`
              );
            }
          }
        }

        return violations;
      };

      const violations = checkNamingConvention(globalStrings);
      expect(violations).toHaveLength(0);
    });
  });
});
