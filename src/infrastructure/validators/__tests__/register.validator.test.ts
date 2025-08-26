import { RegisterValidator } from '../register.validator';
import { RegisterDto } from '@/domain/dtos/register.dto';
import globalStrings from '@/config/strings/global.strings.json';

// Mock RegisterDto
jest.mock('@/domain/dtos/register.dto');

const MockedRegisterDto = RegisterDto as jest.MockedClass<typeof RegisterDto>;
const { DATA_VALIDATION } = globalStrings.ERRORS;
const { VALIDATION } = globalStrings.ERRORS.AUTH.REGISTER;

describe('RegisterValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock RegisterDto.createFrom to return a valid DTO
    const mockDto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!'
    } as RegisterDto;
    
    (MockedRegisterDto.createFrom as jest.Mock).mockReturnValue([undefined, mockDto]);
  });

  describe('validate method', () => {
    describe('successful validation', () => {
      it('should validate correct data and return RegisterDto', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(validData);

        expect(error).toBeUndefined();
        expect(dto).toBeDefined();
        expect(MockedRegisterDto.createFrom).toHaveBeenCalledWith({
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        });
      });

      it('should convert email to lowercase', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'JOHN.DOE@EXAMPLE.COM',
          password: 'SecurePass123!'
        };

        RegisterValidator.validate(validData);

        expect(MockedRegisterDto.createFrom).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'john.doe@example.com'
          })
        );
      });

      it('should handle minimum valid lengths', () => {
        const validData = {
          name: 'Jo',
          lastname: 'Do',
          email: 'a@b.co',
          password: 'Pass123!'
        };

        const [error, dto] = RegisterValidator.validate(validData);

        expect(error).toBeUndefined();
        expect(dto).toBeDefined();
      });

      it('should handle maximum valid lengths', () => {
        const validData = {
          name: 'A'.repeat(50),
          lastname: 'B'.repeat(50),
          email: 'test@' + 'a'.repeat(90) + '.com',
          password: 'A'.repeat(120) + 'Pass123!'
        };

        const [error, dto] = RegisterValidator.validate(validData);

        expect(error).toBeUndefined();
        expect(dto).toBeDefined();
      });
    });

    describe('name validation errors', () => {
      it('should return error for name too short', () => {
        const invalidData = {
          name: 'J',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.NAME.MIN_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for name too long', () => {
        const invalidData = {
          name: 'A'.repeat(51),
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.NAME.MAX_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for invalid name format', () => {
        const invalidData = {
          name: 'John123',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.NAME.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for name with special characters', () => {
        const invalidData = {
          name: 'John@',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.NAME.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });
    });

    describe('lastname validation errors', () => {
      it('should return error for lastname too short', () => {
        const invalidData = {
          name: 'John',
          lastname: 'D',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.LASTNAME.MIN_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for lastname too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'B'.repeat(51),
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.LASTNAME.MAX_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for invalid lastname format', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe123',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.LASTNAME.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });
    });

    describe('email validation errors', () => {
      it('should return error for invalid email format', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'invalid-email',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.EMAIL.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for email too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'a'.repeat(95) + '@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.EMAIL.MAX_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for email without @ symbol', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'johndoeexample.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.EMAIL.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for email without domain', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john@',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.EMAIL.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });
    });

    describe('password validation errors', () => {
      it('should return error for password too short', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'Pass1!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.MIN_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for password too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'A'.repeat(129)
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.MAX_LENGTH);
        expect(dto).toBeUndefined();
      });

      it('should return error for weak password format', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'password'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for password without uppercase', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for password without numbers', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });

      it('should return error for password without special characters', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toContain(VALIDATION.PASSWORD.INVALID_FORMAT);
        expect(dto).toBeUndefined();
      });
    });

    describe('multiple validation errors', () => {
      it('should return multiple error messages for multiple invalid fields', () => {
        const invalidData = {
          name: 'J',
          lastname: 'D',
          email: 'invalid-email',
          password: 'weak'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(error).toContain('name');
        expect(error).toContain('lastname');
        expect(error).toContain('email');
        expect(error).toContain('password');
        expect(dto).toBeUndefined();
      });

      it('should format multiple errors with comma separation', () => {
        const invalidData = {
          name: '',
          lastname: '',
          email: '',
          password: ''
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(error).toContain(', ');
        expect(dto).toBeUndefined();
      });
    });

    describe('missing fields', () => {
      it('should return error for missing name', () => {
        const invalidData = {
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(dto).toBeUndefined();
      });

      it('should return error for missing lastname', () => {
        const invalidData = {
          name: 'John',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(dto).toBeUndefined();
      });

      it('should return error for missing email', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          password: 'SecurePass123!'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(dto).toBeUndefined();
      });

      it('should return error for missing password', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com'
        };

        const [error, dto] = RegisterValidator.validate(invalidData);

        expect(error).toBeDefined();
        expect(dto).toBeUndefined();
      });
    });

    describe('error handling', () => {
      it('should handle unknown validation errors', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        // Mock RegisterDto.createFrom to throw an error
        (MockedRegisterDto.createFrom as jest.Mock).mockImplementation(() => {
          throw new Error('Unknown error');
        });

        const [error, dto] = RegisterValidator.validate(validData);

        expect(error).toBe(DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR);
        expect(dto).toBeUndefined();
      });

      it('should handle RegisterDto creation failure', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        // Mock RegisterDto.createFrom to return error
        (MockedRegisterDto.createFrom as jest.Mock).mockReturnValue(['DTO creation failed', undefined]);

        const [error, dto] = RegisterValidator.validate(validData);

        expect(error).toBe('DTO creation failed');
        expect(dto).toBeUndefined();
      });
    });

    describe('return type validation', () => {
      it('should return tuple with error as first element on validation failure', () => {
        const invalidData = {
          name: 'J',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const result = RegisterValidator.validate(invalidData);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(typeof result[0]).toBe('string');
        expect(result[1]).toBeUndefined();
      });

      it('should return tuple with dto as second element on validation success', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const result = RegisterValidator.validate(validData);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0]).toBeUndefined();
        expect(result[1]).toBeDefined();
      });
    });

    describe('method signature', () => {
      it('should be a static method', () => {
        expect(typeof RegisterValidator.validate).toBe('function');
        expect(RegisterValidator.validate.length).toBe(1);
      });

      it('should accept object with string keys', () => {
        const data = { test: 'value' };
        
        // Should not throw for accepting the parameter type
        expect(() => RegisterValidator.validate(data)).not.toThrow();
      });
    });
  });
});