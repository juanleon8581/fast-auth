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

        const dto = RegisterValidator.validate(validData);

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

        const dto = RegisterValidator.validate(validData);

        expect(dto).toBeDefined();
      });

      it('should handle maximum valid lengths', () => {
        const validData = {
          name: 'A'.repeat(50),
          lastname: 'B'.repeat(50),
          email: 'test@' + 'a'.repeat(90) + '.com',
          password: 'A'.repeat(120) + 'Pass123!'
        };

        const dto = RegisterValidator.validate(validData);

        expect(dto).toBeDefined();
      });
    });

    describe('name validation errors', () => {
      it('should throw error for name too short', () => {
        const invalidData = {
          name: 'J',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.NAME.MIN_LENGTH);
      });

      it('should throw error for name too long', () => {
        const invalidData = {
          name: 'A'.repeat(51),
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.NAME.MAX_LENGTH);
      });

      it('should throw error for name with invalid characters', () => {
        const invalidData = {
          name: 'John123',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.NAME.INVALID_FORMAT);
      });

      it('should throw error for missing name', () => {
        const invalidData = {
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow('Required');
      });
    });

    describe('lastname validation errors', () => {
      it('should throw error for lastname too short', () => {
        const invalidData = {
          name: 'John',
          lastname: 'D',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.LASTNAME.MIN_LENGTH);
      });

      it('should throw error for lastname too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'B'.repeat(51),
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.LASTNAME.MAX_LENGTH);
      });

      it('should throw error for lastname with invalid characters', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe123',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.LASTNAME.INVALID_FORMAT);
      });

      it('should throw error for missing lastname', () => {
        const invalidData = {
          name: 'John',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow('Required');
      });
    });

    describe('email validation errors', () => {
      it('should throw error for invalid email format', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'invalid-email',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.EMAIL.INVALID_FORMAT);
      });

      it('should throw error for email too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'test@' + 'a'.repeat(250) + '.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.EMAIL.MAX_LENGTH);
      });

      it('should throw error for missing email', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow('Required');
      });
    });

    describe('password validation errors', () => {
      it('should throw error for password too short', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'Pass1!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.MIN_LENGTH);
      });

      it('should throw error for password too long', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'A'.repeat(129)
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.MAX_LENGTH);
      });

      it('should throw error for password without uppercase', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'securepass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.INVALID_FORMAT);
      });

      it('should throw error for password without lowercase', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SECUREPASS123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.INVALID_FORMAT);
      });

      it('should throw error for password without numbers', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.INVALID_FORMAT);
      });

      it('should throw error for password without special characters', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.INVALID_FORMAT);
      });

      it('should throw error for missing password', () => {
        const invalidData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow('Required');
      });
    });

    describe('edge cases', () => {
      it('should throw error for null input', () => {
        expect(() => RegisterValidator.validate(null as any)).toThrow();
      });

      it('should throw error for undefined input', () => {
        expect(() => RegisterValidator.validate(undefined as any)).toThrow();
      });

      it('should throw error for empty object', () => {
        expect(() => RegisterValidator.validate({})).toThrow();
      });

      it('should throw error for non-object input', () => {
        expect(() => RegisterValidator.validate('string' as any)).toThrow();
      });
    });

    describe('DTO creation errors', () => {
      it('should throw error when RegisterDto.createFrom returns error', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        // Mock RegisterDto.createFrom to return an error
        (MockedRegisterDto.createFrom as jest.Mock).mockReturnValue(['DTO creation error', null]);

        expect(() => RegisterValidator.validate(validData)).toThrow('DTO creation error');
      });
    });

    describe('return type validation', () => {
      it('should throw error on validation failure', () => {
        const invalidData = {
          name: 'J',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow();
      });

      it('should return dto on validation success', () => {
        const validData = {
          name: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        };

        const result = RegisterValidator.validate(validData);

        expect(result).toBeDefined();
        expect(result).toBeDefined();
      });
    });

    describe('method signature', () => {
      it('should be a static method', () => {
        expect(typeof RegisterValidator.validate).toBe('function');
        expect(RegisterValidator.validate.length).toBe(1);
      });

      it('should accept object with string keys', () => {
        const data = { test: 'value' };
        
        expect(() => RegisterValidator.validate(data)).toThrow();
      });
    });
  });
});