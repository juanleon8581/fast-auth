import { RegisterDto } from '../register.dto';
import { clearAllMocks } from '@/config/tests/test-utils';

describe('RegisterDto', () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe('createFrom', () => {
    it('should create RegisterDto successfully with valid data', () => {
      const validData = {
        name: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123'
      };

      const [error, dto] = RegisterDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto?.name).toBe('John');
      expect(dto?.lastname).toBe('Doe');
      expect(dto?.email).toBe('john.doe@example.com');
      expect(dto?.password).toBe('securePassword123');
    });

    it('should return error when name is missing', () => {
      const invalidData = {
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123'
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when lastname is missing', () => {
      const invalidData = {
        name: 'John',
        email: 'john.doe@example.com',
        password: 'securePassword123'
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when email is missing', () => {
      const invalidData = {
        name: 'John',
        lastname: 'Doe',
        password: 'securePassword123'
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when password is missing', () => {
      const invalidData = {
        name: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com'
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when all fields are missing', () => {
      const invalidData = {};

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when fields are empty strings', () => {
      const invalidData = {
        name: '',
        lastname: '',
        email: '',
        password: ''
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when fields are null', () => {
      const invalidData = {
        name: null,
        lastname: null,
        email: null,
        password: null
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should return error when fields are undefined', () => {
      const invalidData = {
        name: undefined,
        lastname: undefined,
        email: undefined,
        password: undefined
      };

      const [error, dto] = RegisterDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it('should handle extra properties in input data', () => {
      const dataWithExtraProps = {
        name: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
        extraField: 'should be ignored',
        anotherField: 123
      };

      const [error, dto] = RegisterDto.createFrom(dataWithExtraProps);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RegisterDto);
      expect(dto?.name).toBe('John');
      expect(dto?.lastname).toBe('Doe');
      expect(dto?.email).toBe('john.doe@example.com');
      expect(dto?.password).toBe('securePassword123');
    });
  });

  describe('constructor', () => {
    it('should create RegisterDto instance with readonly properties', () => {
      const dto = new RegisterDto('John', 'Doe', 'john@example.com', 'password123');

      expect(dto.name).toBe('John');
      expect(dto.lastname).toBe('Doe');
      expect(dto.email).toBe('john@example.com');
      expect(dto.password).toBe('password123');

      // Properties are readonly at TypeScript level but not frozen at runtime
      // @ts-ignore
      dto.name = 'Jane';
      // @ts-ignore
      expect(dto.name).toBe('Jane'); // This will pass because object is not frozen
    });
  });
});